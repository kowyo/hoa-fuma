"""Format MDX files in content/docs/ directory.

This script performs the following transformations:
1. Removes markdown-styled HTML comments (<!-- -->)
2. Removes shield.io badges
3. Converts Hugo shortcodes to Fumadocs UI components
   - {{% details title="..." %}} → <Accordions>/<Accordion>
"""

import re
from pathlib import Path


def remove_html_comments(content: str) -> str:
    """Remove HTML comments from content."""
    return re.sub(r"<!--[\s\S]*?-->", "", content)


def remove_shield_badges(content: str) -> str:
    """Remove shield.io badges (markdown image syntax)."""
    # Match ![...](https://img.shields.io/...) pattern
    return re.sub(r"!\[[^\]]*\]\(https://img\.shields\.io/[^)]+\)\s*", "", content)


def fix_self_closing_tags(content: str) -> str:
    """Convert HTML tags to self-closing format for MDX compatibility."""
    # Convert <br> to <br />
    content = re.sub(r"<br\s*>", "<br />", content)
    # Convert <hr> to <hr />
    content = re.sub(r"<hr\s*>", "<hr />", content)
    return content


def fix_malformed_html(content: str) -> str:
    """Fix common malformed HTML patterns."""
    # Remove empty <tr> tags (tr with no content before closing)
    content = re.sub(r"<tr>\s*</table>", "</table>", content)
    # Remove empty <tr></tr> tags
    content = re.sub(r"<tr>\s*</tr>", "", content)
    return content


def css_property_to_camel_case(prop: str) -> str:
    """Convert CSS property name to camelCase for JSX."""
    parts = prop.strip().split("-")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


def convert_style_to_jsx(content: str) -> str:
    """Convert HTML style attributes to JSX format.

    Converts style="text-align:center;" to style={{textAlign: "center"}}
    """

    def convert_style_attr(match: re.Match[str]) -> str:
        style_str = match.group(1)
        # Parse CSS properties
        jsx_props = []
        for prop in style_str.split(";"):
            prop = prop.strip()
            if not prop or ":" not in prop:
                continue
            name, value = prop.split(":", 1)
            camel_name = css_property_to_camel_case(name.strip())
            jsx_props.append(f'{camel_name}: "{value.strip()}"')

        if jsx_props:
            return "style={{" + ", ".join(jsx_props) + "}}"
        return ""

    return re.sub(r'style="([^"]*)"', convert_style_attr, content)


def escape_curly_braces_in_math(content: str) -> str:
    """Escape curly braces inside LaTeX math expressions for MDX compatibility.

    In MDX, curly braces are interpreted as JSX expressions.
    We need to escape them inside $...$ and $$...$$ math blocks.
    """

    def escape_braces(match: re.Match[str]) -> str:
        """Escape { and } inside a math expression."""
        math_content = match.group(1)
        # Escape { and } that are not already escaped
        escaped = re.sub(r"(?<!\\)\{", r"\\{", math_content)
        escaped = re.sub(r"(?<!\\)\}", r"\\}", escaped)
        return match.group(0)[0] + escaped + match.group(0)[-1]

    # Handle inline math $...$
    content = re.sub(r"\$([^$]+)\$", escape_braces, content)

    # Handle display math $$...$$
    content = re.sub(r"\$\$([^$]+)\$\$", escape_braces, content)

    return content


def convert_hugo_details_to_accordion(content: str) -> str:
    """Convert Hugo details shortcode to Fumadocs Accordion components.

    Converts:
        {{% details title="My Title" closed="true" %}}
        Content here
        {{% /details %}}

    To:
        <Accordion title="My Title">
        Content here
        </Accordion>

    Multiple adjacent Accordion blocks are wrapped in a single <Accordions> block.
    """
    # Handle single-line shortcodes first:
    # {{% details title="..." %}} content {{% /details %}}
    content = re.sub(
        r'\{{% details title="([^"]*)"[^%]*%\}\}\s*(.+?)\s*\{{% /details %\}\}',
        r'<Accordion title="\1">\n\2\n</Accordion>',
        content,
    )

    # Convert opening tag: {{% details title="..." ... %}}
    content = re.sub(
        r'\{{% details title="([^"]*)"[^%]*%\}\}',
        r'<Accordion title="\1">',
        content,
    )

    # Handle closing tags - first normalize multiple closing tags on same line
    # "{{% /details %}} {{% /details %}}" -> "\n</Accordion>\n</Accordion>"
    def replace_closing_tags(line: str) -> str:
        """Replace all {{% /details %}} in a line, ensuring proper newlines."""
        if "{{% /details %}}" not in line:
            return line
        # Split by the closing tag
        parts = line.split("{{% /details %}}")
        result_parts = []
        for i, part in enumerate(parts):
            if i == 0 and part.strip():
                # First part has content before closing tag
                result_parts.append(part.rstrip())
            elif part.strip():
                # Middle parts
                result_parts.append(part.strip())
            if i < len(parts) - 1:
                result_parts.append("</Accordion>")
        return "\n".join(result_parts)

    lines = content.split("\n")
    content = "\n".join(replace_closing_tags(line) for line in lines)

    # Now wrap consecutive Accordion blocks in Accordions
    lines = content.split("\n")
    result: list[str] = []
    in_accordion_sequence = False
    accordion_buffer: list[str] = []
    accordion_depth = 0

    for i, line in enumerate(lines):
        # Check if this line starts an Accordion
        if "<Accordion " in line and not in_accordion_sequence:
            in_accordion_sequence = True
            accordion_buffer = [line]
            accordion_depth = 1
        elif in_accordion_sequence:
            accordion_buffer.append(line)

            # Track depth
            if "<Accordion " in line:
                accordion_depth += 1
            if "</Accordion>" in line:
                accordion_depth -= 1

            # Check if we've closed all accordions and next non-empty line is not an Accordion
            if accordion_depth == 0:
                # Peek ahead to see if next non-empty line is another Accordion
                remaining_idx = i + 1
                next_accordion = False
                while remaining_idx < len(lines):
                    next_line = lines[remaining_idx].strip()
                    if next_line == "":
                        remaining_idx += 1
                        continue
                    if "<Accordion " in next_line:
                        next_accordion = True
                    break

                if not next_accordion:
                    # End of accordion sequence, wrap and flush
                    result.append("<Accordions>")
                    result.extend(accordion_buffer)
                    result.append("</Accordions>")
                    in_accordion_sequence = False
                    accordion_buffer = []
        else:
            result.append(line)

    # Handle case where file ends with accordion sequence
    if accordion_buffer:
        result.append("<Accordions>")
        result.extend(accordion_buffer)
        result.append("</Accordions>")

    return "\n".join(result)


def format_mdx_file(filepath: Path) -> bool:
    """Format a single MDX file. Returns True if file was modified."""
    original = filepath.read_text()
    content = original

    # Apply transformations
    content = remove_html_comments(content)
    content = remove_shield_badges(content)
    content = fix_self_closing_tags(content)
    content = fix_malformed_html(content)
    content = convert_style_to_jsx(content)
    content = escape_curly_braces_in_math(content)
    content = convert_hugo_details_to_accordion(content)

    # Clean up multiple consecutive blank lines
    content = re.sub(r"\n{3,}", "\n\n", content)

    if content != original:
        filepath.write_text(content)
        return True
    return False


def main() -> None:
    """Format all MDX files in content/docs/."""
    docs_dir = Path(__file__).parent.parent / "content" / "docs"

    if not docs_dir.exists():
        print(f"Error: {docs_dir} does not exist")
        return

    mdx_files = list(docs_dir.rglob("*.mdx"))
    print(f"Found {len(mdx_files)} MDX files")

    modified_count = 0
    for filepath in mdx_files:
        if format_mdx_file(filepath):
            modified_count += 1
            print(f"  Modified: {filepath.relative_to(docs_dir)}")

    print(f"\nDone! Modified {modified_count} files.")


if __name__ == "__main__":
    main()
