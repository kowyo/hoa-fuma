.PHONY: generate format content build dev clean

# Generate pages from GitHub repos
generate:
	uv run --project scripts python scripts/main.py

# Format MDX files for Fumadocs compatibility
format:
	uv run --project scripts python scripts/format_mdx.py

# Clean and regenerate all content
content: clean generate format

# Clean content directory
clean:
	rm -rf content/docs

# Build the site
build: content
	pnpm build

# Run development server
dev:
	pnpm dev
