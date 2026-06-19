import argparse
import hashlib
import json
import re
from pathlib import Path

# Load configuration
CONFIG_FILE = Path(__file__).resolve().parent / 'config.json'
with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
    CONFIG = json.load(f)

POSTS_INPUT_PATTERN = CONFIG['data']['posts_input_pattern']
COMMENTS_INPUT_FILE = CONFIG['data']['comments_input_file']
POSTS_OUTPUT_FILE = CONFIG['data']['posts_output_file']
COMMENTS_OUTPUT_FILE = CONFIG['data']['comments_output_file']
MIN_WORDS = CONFIG['data']['min_words']

# Rule 1: first TWO words both >= 3 chars and capitalized, followed by optional comma/colon/spaces
RULE1_RE = re.compile(r'^[A-Z][a-zA-Z\'\-]{2,}\s+[A-Z][a-zA-Z\'\-]{2,}[,:\s]+')
# Rule 2: first word capitalized and immediately followed by a comma or colon
RULE2_RE = re.compile(r'^[A-Z][a-zA-Z\'\-]+[,:]\s+')
# Rule 3: starts with @, remove the @mention (handles "@Word" or "@First Last" patterns)
RULE3_RE = re.compile(r'^@[A-Za-z][a-zA-Z\'\-]*(?:\s+[A-Z][a-zA-Z\'\-]+)*[,:\s]+')

# Remove emoji and pictograph ranges so memory text remains plain text.
EMOJI_RE = re.compile(
    "["
    "\U0001F300-\U0001F5FF"  # Symbols & pictographs
    "\U0001F600-\U0001F64F"  # Emoticons
    "\U0001F680-\U0001F6FF"  # Transport & map symbols
    "\U0001F700-\U0001F77F"  # Alchemical symbols
    "\U0001F780-\U0001F7FF"  # Geometric shapes extended
    "\U0001F800-\U0001F8FF"  # Supplemental arrows-c
    "\U0001F900-\U0001F9FF"  # Supplemental symbols and pictographs
    "\U0001FA00-\U0001FAFF"  # Symbols and pictographs extended-a
    "\U00002700-\U000027BF"  # Dingbats
    "\U00002600-\U000026FF"  # Misc symbols
    "]+",
    flags=re.UNICODE,
)


def word_count(text: str) -> int:
    return len(text.split())


def mojibake_score(text: str) -> int:
    """Higher score means text looks more like mojibake."""
    score = 0
    score += sum(text.count(ch) for ch in ("Ã", "â", "Â", "ð", "�"))
    score += sum(1 for ch in text if 0x80 <= ord(ch) <= 0x9F)
    return score


def fix_unicode_text(text: str) -> str:
    """Repair common mojibake from UTF-8 text decoded as Latin-1/CP1252."""
    fixed = text
    for _ in range(3):
        if mojibake_score(fixed) == 0:
            break
        try:
            candidate = fixed.encode("latin-1").decode("utf-8")
        except UnicodeError:
            break
        if candidate == fixed:
            break
        if mojibake_score(candidate) >= mojibake_score(fixed):
            break
        fixed = candidate

    replacements = {
        "’": "'",
        "‘": "'",
        "“": '"',
        "”": '"',
        "–": "-",
        "—": "-",
        "…": "...",
    }
    for src, dst in replacements.items():
        fixed = fixed.replace(src, dst)

    # Strip emoji/pictographs from training text.
    fixed = EMOJI_RE.sub("", fixed)

    return fixed


def strip_name_prefix(text: str) -> str:
    """Remove a leading name/mention from a reply comment using explicit rules."""
    m = RULE3_RE.match(text)
    if m:
        return text[m.end():].strip()

    m = RULE1_RE.match(text)
    if m:
        return text[m.end():].strip()

    m = RULE2_RE.match(text)
    if m:
        return text[m.end():].strip()

    return text


def build_source_id(text: str, timestamp: str, source_type: str) -> str:
    """Build a stable ID used to link chunks back to the original record."""
    seed = f"{source_type}|{timestamp}|{text.strip()}"
    return hashlib.sha256(seed.encode("utf-8")).hexdigest()


def write_json_output(output_file: str, payload: list[dict], label: str) -> None:
    """Write JSON output in overwrite mode and log whether overwrite occurred."""
    output_path = Path(output_file)
    if output_path.exists():
        print(f"Overwriting existing {label} file: {output_file}")
    else:
        print(f"Creating new {label} file: {output_file}")

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=4)


def process_posts() -> tuple[int, int]:
    input_files = sorted(Path('.').glob(POSTS_INPUT_PATTERN))
    if not input_files:
        raise FileNotFoundError(
            f"No input files found for pattern: {POSTS_INPUT_PATTERN}"
        )

    cleaned_posts = []

    for input_file in input_files:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        for item in data:
            timestamp = item.get('timestamp', 'Unknown Date')
            data_entries = item.get('data', [])

            post_text = None
            for entry in data_entries:
                if isinstance(entry, dict):
                    text = entry.get('post')
                    if isinstance(text, str) and text.strip():
                        post_text = fix_unicode_text(text.strip())
                        break

            if post_text and word_count(post_text) > MIN_WORDS:
                source_type = "post"
                cleaned_posts.append({
                    "text": post_text,
                    "metadata": {
                        "timestamp": str(timestamp),
                        "source_type": source_type,
                        "source_id": build_source_id(
                            post_text,
                            str(timestamp),
                            source_type,
                        ),
                    }
                })

    write_json_output(POSTS_OUTPUT_FILE, cleaned_posts, "posts")

    return len(input_files), len(cleaned_posts)


def process_comments() -> int:
    with open(COMMENTS_INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    comments = data.get('comments_v2', [])
    cleaned_comments = []

    for item in comments:
        timestamp = item.get('timestamp', 'Unknown Date')
        title = item.get('title', '')
        data_entries = item.get('data', [])

        for entry in data_entries:
            if not isinstance(entry, dict):
                continue

            comment_obj = entry.get('comment')
            if not isinstance(comment_obj, dict):
                continue

            text = comment_obj.get('comment', '')
            if not isinstance(text, str) or not text.strip():
                continue

            text = fix_unicode_text(text.strip())

            is_reply = 'replied' in title.lower()
            if is_reply:
                text = strip_name_prefix(text)

            if word_count(text) <= MIN_WORDS:
                continue

            source_type = "reply" if is_reply else "comment"

            cleaned_comments.append({
                "text": text,
                "metadata": {
                    "timestamp": str(timestamp),
                    "type": source_type,
                    "source_type": source_type,
                    "source_id": build_source_id(
                        text,
                        str(timestamp),
                        source_type,
                    ),
                }
            })

    write_json_output(COMMENTS_OUTPUT_FILE, cleaned_comments, "comments")

    return len(cleaned_comments)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Prepare cleaned Facebook posts/comments for memory import."
    )
    parser.add_argument(
        "--mode",
        choices=["posts", "comments", "both"],
        default="both",
        help="What to process (default: both).",
    )
    args = parser.parse_args()

    if args.mode in ("posts", "both"):
        file_count, post_count = process_posts()
        print(f"Loaded {file_count} post files and cleaned {post_count} posts.")

    if args.mode in ("comments", "both"):
        comment_count = process_comments()
        print(f"Cleaned {comment_count} comments.")


if __name__ == "__main__":
    main()
