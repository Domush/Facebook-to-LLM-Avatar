import json
import shutil
import os
from langchain_openai import OpenAIEmbeddings

try:
    from langchain.schema import Document
except ModuleNotFoundError:
    try:
        from langchain_core.documents import Document
    except ModuleNotFoundError as exc:
        raise ModuleNotFoundError(
            "Missing Document dependency. Install with: pip install langchain-core"
        ) from exc

try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
except ModuleNotFoundError:
    try:
        from langchain_text_splitters import RecursiveCharacterTextSplitter
    except ModuleNotFoundError as exc:
        raise ModuleNotFoundError(
            "Missing text splitter dependency. Install with: "
            "pip install langchain-text-splitters"
        ) from exc

try:
    from langchain_community.vectorstores import Chroma
except ModuleNotFoundError:
    try:
        from langchain.vectorstores import Chroma
    except ModuleNotFoundError as exc:
        raise ModuleNotFoundError(
            "Missing Chroma dependency. Install with: "
            "pip install langchain-community chromadb"
        ) from exc

MEMORY_DB_PATH = "./avatar_memory_db"
DOCUMENT_INDEX_FILE = "document_index.json"

# --- Prompt: what to import ---
print("What would you like to import into the memory bank?")
print("  1 - Posts only")
print("  2 - Comments only")
print("  3 - Both posts and comments")
choice = input("Enter 1, 2, or 3: ").strip()

while choice not in ("1", "2", "3"):
    choice = input("Invalid choice. Enter 1, 2, or 3: ").strip()

import_posts    = choice in ("1", "3")
import_comments = choice in ("2", "3")

# --- Wipe existing memory bank ---
if os.path.exists(MEMORY_DB_PATH):
    print(f"Wiping existing memory bank at {MEMORY_DB_PATH}...")
    shutil.rmtree(MEMORY_DB_PATH)
    print("Memory bank wiped.")

# --- Connects to LM Studio's Local Server ---
embeddings = OpenAIEmbeddings(
    openai_api_base="http://localhost:1234/v1",
    openai_api_key="lm-studio",
    model="nomic-embed-text",  # Must match your loaded model name in LM Studio
    # LM Studio embedding endpoint expects strings, not token-id arrays.
    check_embedding_ctx_length=False
)

raw_documents = []

if import_posts:
    with open('cleaned_posts.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)
    raw_documents.extend(
        Document(page_content=p['text'], metadata=p['metadata']) for p in posts
    )
    print(f"Loaded {len(posts)} posts.")

if import_comments:
    with open('cleaned_comments.json', 'r', encoding='utf-8') as f:
        comments = json.load(f)
    raw_documents.extend(
        Document(page_content=c['text'], metadata=c['metadata']) for c in comments
    )
    print(f"Loaded {len(comments)} comments.")

document_index = {}
for doc in raw_documents:
    source_id = doc.metadata.get("source_id")
    if not source_id:
        continue
    document_index[source_id] = {
        "text": doc.page_content,
        "metadata": doc.metadata,
    }

os.makedirs(MEMORY_DB_PATH, exist_ok=True)
index_path = os.path.join(MEMORY_DB_PATH, DOCUMENT_INDEX_FILE)
with open(index_path, 'w', encoding='utf-8') as f:
    json.dump(document_index, f, ensure_ascii=False, indent=2)

print(f"Saved full-document index with {len(document_index)} entries.")

# --- Split long entries ---
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
docs = text_splitter.split_documents(raw_documents)

print(f"Embedding {len(docs)} chunks. This may take 20-60 minutes for large datasets...")

# --- Create the memory bank ---
vectorstore = Chroma.from_documents(
    documents=docs,
    embedding=embeddings,
    persist_directory=MEMORY_DB_PATH
)
print("Memory Bank created successfully!")
