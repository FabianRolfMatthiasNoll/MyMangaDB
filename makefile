.PHONY: backend frontend setup

# Set up the backend: create virtual environment, activate it, and install dependencies
backend:
	@echo "Setting up backend..."
	@cd backend && python -m venv .venv
	@cd backend && .venv\Scripts\activate.bat && pip install -r requirements.txt
	@echo "Backend setup completed."

# Set up the frontend: install npm dependencies
frontend:
	@echo "Setting up frontend..."
	@cd frontend && npm install
	@echo "Frontend setup completed."

# Run both backend and frontend setup
setup: backend frontend
	@echo "Development environment setup completed."
