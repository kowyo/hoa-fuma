.PHONY: prepare install-hooks sync clean help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

prepare: sync install-hooks ## Setup development environment (sync dependencies and install pre-commit hooks)
	@echo "✓ Development environment setup complete!"

sync: ## Install/update dependencies using uv
	uv sync

install-hooks: ## Install pre-commit hooks
	uv run pre-commit install
	@echo "✓ Pre-commit hooks installed!"

run: ## Run main script
	uv run src/hoa_ci/main.py

lint: ## Run ruff linter
	uv run ruff check . --fix

format: ## Run ruff formatter
	uv run ruff format .

pre-commit: ## Run pre-commit on all files
	uv run pre-commit run --all-files
