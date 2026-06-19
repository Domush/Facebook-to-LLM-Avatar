from mcp.server.fastmcp import FastMCP
import chromadb
import json
import requests
import logging
import sys
import math
import time
from pathlib import Path

# Load configuration
CONFIG_FILE = Path(__file__).resolve().parent / 'config.json'
with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
    CONFIG = json.load(f)

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    stream=sys.stderr,
)
logger = logging.getLogger("avatar_mcp")

# Initialize MCP Server
mcp = FastMCP("Avatar Memory Server")

# Connect to the local Chroma Database using a script-relative absolute path
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / CONFIG['memory_db']['path']
INDEX_PATH = DB_PATH / CONFIG['memory_db']['document_index_file']

chroma_client = chromadb.PersistentClient(path=str(DB_PATH))

def load_collection():
    """Load preferred collection; fallback to first available if needed."""
    preferred_name = CONFIG['memory_db']['collection_name']
    try:
        coll = chroma_client.get_collection(name=preferred_name)
        logger.info("Chroma collection '%s' loaded from %s", preferred_name, DB_PATH)
        return coll
    except Exception:
        available = chroma_client.list_collections()
        names = [c.name for c in available]
        if names:
            fallback = names[0]
            coll = chroma_client.get_collection(name=fallback)
            logger.warning(
                "Preferred collection '%s' not found. Using '%s' from %s",
                preferred_name,
                fallback,
                DB_PATH,
            )
            return coll
        logger.error("No collections found in %s", DB_PATH)
        return None

collection = load_collection()


def load_document_index() -> dict[str, dict]:
    """Load source_id -> full document mapping written by 2_build_memory.py."""
    if not INDEX_PATH.exists():
        logger.warning("Document index file not found at %s", INDEX_PATH)
        return {}

    try:
        with open(INDEX_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logger.info("Loaded document index entries=%d", len(data))
        return data
    except Exception:
        logger.exception("Failed to load document index from %s", INDEX_PATH)
        return {}


document_index = load_document_index()


def calculate_recency_score(timestamp: int | str, half_life_days: float = None) -> float:
    if half_life_days is None:
        half_life_days = CONFIG['search']['recency_half_life_days']
    """
    Calculate recency score using exponential decay.
    Newer documents score higher.
    
    Args:
        timestamp: Unix timestamp (int) or string representation
        half_life_days: Days until score drops to 50% (default: 180 days ~6 months)
    
    Returns:
        Recency score between 0 and 1, where 1.0 is today.
    """
    try:
        ts = int(timestamp) if isinstance(timestamp, str) else timestamp
        current_time = time.time()
        age_seconds = max(0, current_time - ts)
        age_days = age_seconds / 86400.0
        recency = math.exp(-age_days / half_life_days)
        return recency
    except (ValueError, TypeError):
        logger.warning("Invalid timestamp for recency calculation: %s", timestamp)
        return 0.5  # Neutral score for unparseable timestamps


def get_embedding(text: str) -> list[float]:
    """Ask LM Studio's Local Server to embed the search query."""
    url = f"{CONFIG['embeddings']['api_base']}/embeddings"
    headers = {"Content-Type": "application/json"}
    data = {
        "input": text,
        "model": CONFIG['embeddings']['model_name']
    }
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()['data'][0]['embedding']

@mcp.tool()
def search_my_memory(topic: str, num_results: int = None) -> str:
    if num_results is None:
        num_results = CONFIG['search']['default_num_results']
    """
    CRITICAL: Use this tool to search your own memories before answering questions about yourself, your opinions, or your past.
    It returns your historical Facebook posts with priority given to newer/more recent content.
    
    Scoring: Combines semantic similarity with recency (exponential decay, half-life 180 days).
    """
    try:
        if collection is None:
            return (
                "Memory retrieval error: no Chroma collection found. "
                f"Expected DB at: {DB_PATH}. Run 2_build_memory.py first."
            )

        logger.info(
            "search_my_memory called | topic=%r | num_results=%d",
            topic,
            num_results,
        )

        query_embedding = get_embedding(topic)
        
        # Query for more candidates to allow recency re-ranking
        candidate_multiplier = CONFIG['search']['candidate_multiplier']
        candidate_results = num_results * candidate_multiplier
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=candidate_results,
            include=["documents", "metadatas", "distances"]
        )

        documents = results.get('documents', [[]])
        metadatas = results.get('metadatas', [[]])
        distances = results.get('distances', [[]])
        
        if not documents or not documents[0]:
            return "You have no memories or past posts about this topic."
        
        # Combine semantic + recency scores
        scored_hits = []
        for i in range(len(documents[0])):
            doc_text = documents[0][i]
            meta = metadatas[0][i] if metadatas and metadatas[0] else {}
            distance = distances[0][i] if distances and distances[0] else 1.0
            
            # Convert distance to similarity (Chroma uses Euclidean by default, closer is better)
            semantic_score = 1.0 / (1.0 + distance)  # Normalize to 0-1 range
            
            timestamp = meta.get('timestamp')
            recency_score = calculate_recency_score(timestamp) if timestamp else 0.5
            
            # Combine scores: give recency a modest boost
            # This keeps semantic relevance as primary, but advantages newer content
            alpha = CONFIG['search']['recency_weight_alpha']
            final_score = semantic_score + (alpha * recency_score)
            
            source_id = meta.get('source_id')
            
            scored_hits.append({
                'doc_text': doc_text,
                'meta': meta,
                'timestamp': meta.get('timestamp', 'Unknown Date'),
                'source_id': source_id,
                'score': final_score,
                'semantic_score': semantic_score,
                'recency_score': recency_score,
            })
        
        # Sort by combined score (highest first)
        scored_hits.sort(key=lambda x: x['score'], reverse=True)
        
        # Deduplicate by source_id and format results
        formatted_results = []
        seen_source_ids = set()
        
        for hit in scored_hits:
            source_id = hit['source_id']
            
            # Prefer full original records when source_id is available.
            if source_id and source_id in document_index:
                if source_id in seen_source_ids:
                    continue
                seen_source_ids.add(source_id)
                full_doc = document_index[source_id].get('text', hit['doc_text'])
                formatted_results.append(f"Memory from {hit['timestamp']}: \"{full_doc}\"")
                continue
            
            # Legacy fallback for older DBs without source_id/index entries.
            formatted_results.append(f"Memory from {hit['timestamp']}: \"{hit['doc_text']}\"")
            
            # Early exit once we have enough results
            if len(formatted_results) >= num_results:
                break
        
        # Trim to requested size
        formatted_results = formatted_results[:num_results]
        
        logger.info(
            "search_my_memory hits=%d (from %d candidates)",
            len(formatted_results),
            len(scored_hits),
        )
            
        if not formatted_results:
            return "You have no memories or past posts about this topic."
            
        return "YOUR PAST MEMORIES TO MIMIC:\n" + "\n\n".join(formatted_results)
        
    except Exception as e:
        logger.exception("search_my_memory failed")
        return f"Memory retrieval error: {str(e)}"

if __name__ == "__main__":
    logger.info("READY: Avatar Memory MCP server is starting on stdio transport")
    mcp.run(transport='stdio')
