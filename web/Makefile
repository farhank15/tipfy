.PHONY: install run build migrate generate push studio lint format check test clean help

# Default target
all: help

install: ## Install dependencies
	pnpm install

run: ## Run development server
	pnpm dev

build: ## Build the application
	pnpm build

migrate: ## Run database migrations
	pnpm db:migrate

generate: ## Generate database migrations
	pnpm db:generate

push: ## Push schema changes to database
	pnpm db:push

studio: ## Open Drizzle Studio
	pnpm db:studio

lint: ## Run linter
	pnpm lint

format: ## Run formatter check
	pnpm format

check: ## Run formatter and linter fix
	pnpm check

test: ## Run tests
	pnpm test

clean: ## Remove node_modules and build artifacts
	rm -rf node_modules .next dist

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'
