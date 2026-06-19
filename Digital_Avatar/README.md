# Digital Avatar Setup Guide

This project builds a searchable memory bank from your Facebook export and exposes it as an MCP tool for LM Studio.

## What Changed

The current workflow is now config-driven and supports both posts and comments:

- `1_prep_data.py` reads Facebook files from `config.json`, cleans text, removes emoji/mojibake, and writes:
  - `cleaned_posts.json`
  - `cleaned_comments.json`
- `2_build_memory.py` imports posts, comments, or both, then builds:
  - Chroma vector DB in `avatar_memory_db/`
  - Full-document index in `avatar_memory_db/document_index.json`
- `3_avatar_mcp.py` serves `search_my_memory`, combining semantic search with recency scoring.

## Project Files

- `1_prep_data.py`: Data cleaning and normalization.
- `2_build_memory.py`: Embedding + Chroma build pipeline.
- `3_avatar_mcp.py`: MCP server and retrieval logic.
- `config.json`: Central configuration for paths, embeddings, memory DB, and search scoring.

## Python Requirements

Install the current dependencies in your virtual environment:

```bash
pip install -r requirements.txt
```

Equivalent explicit package list:

```bash
pip install mcp chromadb requests langchain-openai langchain-core langchain-community langchain-text-splitters
```

Notes:

- `sentence-transformers` is no longer required for this workflow.
- `2_build_memory.py` has compatibility fallbacks, but the packages above are the expected baseline.

## Data Layout

By default, `config.json` expects Facebook export files under:

- `facebook_data/your_facebook_activity/posts/your_posts__check_ins__photos_and_videos_*.json`
- `facebook_data/your_facebook_activity/comments_and_reactions/comments.json`

If your export is in a different location or filename pattern, update `config.json`.

## LM Studio Setup

Before building or querying memory:

1. Open LM Studio.
2. Start the Local Server.
3. Load the embedding model configured in `config.json` (default: `nomic-embed-text`).
4. Confirm the base URL matches `embeddings.api_base` (default: `http://localhost:1234/v1`).

## End-to-End Workflow

### 1) Prepare cleaned data

Process both posts and comments:

```bash
python 1_prep_data.py --mode both
```

Or run a subset:

```bash
python 1_prep_data.py --mode posts
python 1_prep_data.py --mode comments
```

### 2) Build the memory DB

Run:

```bash
python 2_build_memory.py
```

When prompted, choose:

- `1` posts only
- `2` comments only
- `3` both

Non-interactive example (both):

```bash
printf "3\n" | python 2_build_memory.py
```

If `memory_db.wipe_existing_on_rebuild` is `true` (default), the old DB is removed before rebuilding.

### 3) Start the MCP server

```bash
python 3_avatar_mcp.py
```

The MCP tool exposed is `search_my_memory(topic, num_results=...)`.

## Search Behavior

`3_avatar_mcp.py` ranks results by:

- semantic similarity from embeddings
- recency boost using exponential decay

Tune behavior in `config.json`:

- `search.default_num_results`
- `search.candidate_multiplier`
- `search.recency_half_life_days`
- `search.recency_weight_alpha`

## Troubleshooting

- LM Studio connection errors:
  - Ensure the Local Server is running.
  - Verify `embeddings.api_base` and model name in `config.json`.
- No memory results:
  - Confirm `cleaned_posts.json` and/or `cleaned_comments.json` exist.
  - Re-run `python 1_prep_data.py --mode both` and rebuild.
- Collection or DB errors:
  - Rebuild with `python 2_build_memory.py`.
  - Check `memory_db.path` and `memory_db.collection_name` in `config.json`.
- Long build times:
  - Large exports can take 20-60+ minutes depending on machine and model throughput.
