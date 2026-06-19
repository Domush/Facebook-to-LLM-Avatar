from mcp.server.fastmcp import FastMCP
import chromadb
import json
import requests
import logging
import sys
from pathlib import Path

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
DB_PATH = BASE_DIR / "avatar_memory_db"
INDEX_PATH = DB_PATH / "document_index.json"

chroma_client = chromadb.PersistentClient(path=str(DB_PATH))

def load_collection():
    """Load preferred collection; fallback to first available if needed."""
    preferred_name = "langchain"
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

def get_embedding(text: str) -> list[float]:
    """Ask LM Studio's Local Server to embed the search query."""
    url = "http://localhost:1234/v1/embeddings"
    headers = {"Content-Type": "application/json"}
    data = {
        "input": text,
        "model": "nomic-embed-text"
    }
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()['data'][0]['embedding']

@mcp.tool()
def search_my_memory(topic: str, num_results: int = 30) -> str:
    """
    CRITICAL: Use this tool to search your own memories before answering questions about yourself, your opinions, or your past.
    It returns your historical Facebook posts. Read them to recall your exact beliefs, tone, and writing style.
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
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=num_results
        )

        documents = results.get('documents', [[]])
        metadatas = results.get('metadatas', [[]])
        if not documents or not documents[0]:
            return "You have no memories or past posts about this topic."
        
        formatted_results = []
        seen_source_ids = set()
        for i in range(len(documents[0])):
            doc = documents[0][i]
            meta = metadatas[0][i] if metadatas and metadatas[0] else {}
            timestamp = meta.get('timestamp', 'Unknown Date')
            source_id = meta.get('source_id')

            # Prefer full original records when source_id is available.
            if source_id and source_id in document_index:
                if source_id in seen_source_ids:
                    continue
                seen_source_ids.add(source_id)
                full_doc = document_index[source_id].get('text', doc)
                formatted_results.append(f"Memory from {timestamp}: \"{full_doc}\"")
                continue

            # Legacy fallback for older DBs without source_id/index entries.
            formatted_results.append(f"Memory from {timestamp}: \"{doc}\"")

        logger.info("search_my_memory hits=%d", len(formatted_results))
            
        if not formatted_results:
            return "You have no memories or past posts about this topic."
            
        return "YOUR PAST MEMORIES TO MIMIC:\n" + "\n\n".join(formatted_results)
        
    except Exception as e:
        logger.exception("search_my_memory failed")
        return f"Memory retrieval error: {str(e)}"

if __name__ == "__main__":
    logger.info("READY: Avatar Memory MCP server is starting on stdio transport")
    mcp.run(transport='stdio')
