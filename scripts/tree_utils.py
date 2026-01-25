"""Utilities for converting flat JSON worktree data to nested FileNode tree structure."""

import json
from datetime import datetime
from typing import Any
from urllib.parse import quote

# Files and directories to exclude from the FileTree
EXCLUDED_PATTERNS = {
    ".gitkeep",
    "README.md",
    "LICENSE",
    "tag.txt",
}

EXCLUDED_EXTENSIONS = {".toml"}

EXCLUDED_PREFIXES = {".github/"}


def should_include(path: str) -> bool:
    """Check if a file path should be included in the FileTree."""
    # Check exact matches
    filename = path.split("/")[-1]
    if filename in EXCLUDED_PATTERNS:
        return False

    # Check extensions
    for ext in EXCLUDED_EXTENSIONS:
        if filename.endswith(ext):
            return False

    # Check directory prefixes
    for prefix in EXCLUDED_PREFIXES:
        if path.startswith(prefix):
            return False

    return True


def format_timestamp(unix_ts: int) -> str:
    """Convert Unix timestamp to YYYY-MM-DD format."""
    return datetime.fromtimestamp(unix_ts).strftime("%Y-%m-%d")


def generate_url(repo: str, path: str) -> str:
    """Generate download URL with proper encoding for Chinese characters and spaces."""
    encoded_path = quote(path, safe="/")
    return f"https://gh.hoa.moe/github.com/HITSZ-OpenAuto/{repo}/raw/main/{encoded_path}"


def flat_to_tree(flat_data: dict[str, dict[str, Any]], repo_name: str) -> list[dict]:
    """
    Convert flat paths to nested FileNode tree structure.

    Args:
        flat_data: Dict mapping file paths to metadata {size, time, hash}
        repo_name: Repository name for generating URLs

    Returns:
        List of FileNode dicts representing the root-level items
    """
    # Filter out excluded files
    filtered_data = {k: v for k, v in flat_data.items() if should_include(k)}

    # Build tree structure
    root: dict[str, Any] = {"children": {}}

    for path, meta in filtered_data.items():
        parts = path.split("/")
        current = root

        # Navigate/create folder structure
        for i, part in enumerate(parts[:-1]):
            if part not in current["children"]:
                folder_path = "/".join(parts[: i + 1])
                current["children"][part] = {
                    "id": folder_path,
                    "name": part,
                    "type": "folder",
                    "depth": i,
                    "defaultOpen": False,
                    "children": {},
                }
            current = current["children"][part]

        # Add file
        filename = parts[-1]
        current["children"][filename] = {
            "id": path,
            "name": filename,
            "type": "file",
            "url": generate_url(repo_name, path),
            "size": meta.get("size"),
            "date": format_timestamp(meta["time"]) if "time" in meta else None,
            "depth": len(parts) - 1,
        }

    def convert_children(node: dict) -> list[dict]:
        """Convert children dict to sorted list and recursively process folders."""
        result = []
        for child in sorted(node["children"].values(), key=lambda x: (x["type"] == "file", x["name"].lower())):
            if child["type"] == "folder":
                child_copy = {k: v for k, v in child.items() if k != "children"}
                child_copy["children"] = convert_children(child)
                # Only include folder if it has children after filtering
                if child_copy["children"]:
                    result.append(child_copy)
            else:
                result.append(child)
        return result

    return convert_children(root)


def tree_to_json_string(tree: list[dict]) -> str:
    """Convert tree structure to compact JSON string for embedding in MDX.

    Escapes backslashes and single quotes for safe embedding in JS string literals.
    """
    json_str = json.dumps(tree, ensure_ascii=False, separators=(",", ":"))
    # Escape backslashes first, then single quotes for embedding in '...'
    json_str = json_str.replace("\\", "\\\\").replace("'", "\\'")
    return json_str
