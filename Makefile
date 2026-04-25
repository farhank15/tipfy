.PHONY: install run build migrate generate push studio lint format check test clean help

# Default target
all: help

install: ## Install dependencies in web/
	$(MAKE) -C web install

run: ## Run development server in web/
	$(MAKE) -C web run

build: ## Build the application in web/
	$(MAKE) -C web build

migrate: ## Run database migrations in web/
	$(MAKE) -C web migrate

generate: ## Generate database migrations in web/
	$(MAKE) -C web generate

push: ## Push schema changes to database in web/
	$(MAKE) -C web push

studio: ## Open Drizzle Studio in web/
	$(MAKE) -C web studio

lint: ## Run linter in web/
	$(MAKE) -C web lint

format: ## Run formatter check in web/
	$(MAKE) -C web format

check: ## Run formatter and linter fix in web/
	$(MAKE) -C web check

test: ## Run tests in web/
	$(MAKE) -C web test

clean: ## Remove node_modules and build artifacts in web/
	$(MAKE) -C web clean

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'
