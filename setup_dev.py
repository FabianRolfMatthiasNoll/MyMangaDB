import os
import secrets
import sys

def generate_api_key():
    """Generate a secure API key"""
    return secrets.token_urlsafe(32)

def create_env_file(path, content):
    """Create .env file if it doesn't exist"""
    if not os.path.exists(path):
        with open(path, 'w') as f:
            f.write(content)
        print(f"Created {path}")
    else:
        print(f"{path} already exists, skipping...")

def main():
    # Generate a secure API key
    api_key = generate_api_key()
    
    # Create backend .env
    backend_env = f"""# API Security
API_TOKEN={api_key}

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Database and Image paths
DATABASE_PATH=./data/manga.db
IMAGE_PATH=./data/images
"""
    create_env_file('backend/.env', backend_env)
    
    # Create frontend .env
    frontend_env = f"""# API Configuration
VITE_API_URL=http://localhost:8000
VITE_API_KEY={api_key}
"""
    create_env_file('frontend/.env', frontend_env)
    
    print("\nDevelopment environment setup completed!")
    print("Make sure to add .env files to your .gitignore if they're not already there.")

if __name__ == "__main__":
    main() 