# Digital Avatar Setup Guide

This project creates a digital avatar of yourself inside LM Studio by processing your Facebook data and building a memory retrieval system.

## Project Structure

- **1_prep_data.py** - Cleans your Facebook JSON export into structured post data
- **2_build_memory.py** - Creates a ChromaDB vector database with embeddings of all your posts
- **3_avatar_mcp.py** - MCP server that allows LM Studio to search your memory bank

## Setup Instructions

### Step 1: Install Dependencies

Open your terminal in this folder and run:

```bash
pip install langchain langchain-openai chromadb sentence-transformers mcp requests
```

### Step 2: Add Your Facebook Data

1. Export your Facebook data from Facebook (see <https://www.facebook.com/dyi>)
2. Place the JSON file in this folder
3. Update `input_file` in `1_prep_data.py` to match your filename

### Step 3: Prepare Your Python Environment

Before running the scripts, you'll need LM Studio running:

- Open LM Studio
- Go to the **Local Server** tab (the `<->` icon)
- Load the **Nomic-Embed-Text** model
- Click **Start Server** (it will run on `http://localhost:1234`)

### Step 4: Clean Your Facebook Data

Run the first script to extract and clean your posts:

```bash
python 1_prep_data.py
```

This creates `cleaned_posts.json` with your posts and timestamps.

### Step 5: Build Your Memory Bank

Run the second script to create embeddings and store them in ChromaDB:

```bash
python 2_build_memory.py
```

**⚠️ This may take 20-60 minutes for 28,000 posts.** Let it run to completion.

This creates a `avatar_memory_db` folder containing your searchable memory database.

### Step 6: Start Your MCP Memory Server

Run the third script to start the MCP bridge:

```bash
python 3_avatar_mcp.py
```

This server will connect your avatar's memory to LM Studio.

## Next Steps

Once the MCP server is running, you can:

1. Configure LM Studio to use this MCP server
2. Chat with your avatar and it will automatically search your memories
3. The avatar will respond in your voice, drawing from your actual Facebook history

## Troubleshooting

- **Memory retrieval errors**: Make sure LM Studio is running and the embedding server is active on `http://localhost:1234`
- **Missing Facebook data**: Update the filename in `1_prep_data.py` to match your export file
- **Long processing time**: This is normal for large datasets. The embedding process is computationally intensive
