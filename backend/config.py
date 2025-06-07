import os
import json
import sys
from pathlib import Path

CONFIG_FILE = "config.json"

def get_default_paths():
    # Get the user's home directory
    home_path = os.path.expanduser("~")
    
    # Create MyMangaDB directory in the appropriate location based on OS
    if sys.platform == "win32":  # For Windows
        appdata_path = os.getenv("APPDATA")
        if not appdata_path:
            raise EnvironmentError("APPDATA environment variable is not set.")
        base_dir = os.path.join(appdata_path, "MyMangaDB")
    elif sys.platform == "darwin":  # For macOS
        base_dir = os.path.join(home_path, "Library", "Application Support", "MyMangaDB")
    else:  # For Linux and others
        base_dir = os.path.join(home_path, ".config", "MyMangaDB")
    
    # Create the base directory if it doesn't exist
    os.makedirs(base_dir, exist_ok=True)
    
    # Set up paths for database and images
    db_path = os.path.join(base_dir, "MyMangaDB.db")
    image_path = os.path.join(base_dir, "images")
    
    # Create images directory if it doesn't exist
    os.makedirs(image_path, exist_ok=True)
    
    return {
        "database_path": db_path,
        "image_path": image_path
    }

def load_config():
    config_path = os.path.join(os.path.dirname(__file__), CONFIG_FILE)
    if os.path.exists(config_path):
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            print("Error reading config file, using defaults")
            return get_default_paths()
    return get_default_paths()

def save_config(config):
    config_path = os.path.join(os.path.dirname(__file__), CONFIG_FILE)
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=4)

# Load configuration
config = load_config()

# Export settings
DATABASE_PATH = config["database_path"]
IMAGE_PATH = config["image_path"] 