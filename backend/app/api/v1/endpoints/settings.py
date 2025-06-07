from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict
import os
import shutil
import sys
import subprocess
from backend.config import load_config, save_config, get_default_paths

router = APIRouter()

@router.get("/getAll")
def get_all_settings():
    return load_config()

@router.get("/{key}")
def get_setting(key: str):
    config = load_config()
    if key not in config:
        raise HTTPException(status_code=404, detail=f"Setting '{key}' not found")
    return {key: config[key]}

@router.post("/{key}")
def create_or_update_setting(key: str, value: str, migrate: bool = False, background_tasks: BackgroundTasks = None):
    config = load_config()
    old_value = config.get(key)
    
    # Validate the new path
    if key in ["database_path", "image_path"]:
        if not os.path.exists(os.path.dirname(value)):
            try:
                os.makedirs(os.path.dirname(value), exist_ok=True)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Could not create directory: {str(e)}")
    
    # Handle database path change
    if key == "database_path" and old_value and old_value != value:
        if migrate:
            if not os.path.exists(old_value):
                raise HTTPException(status_code=404, detail="Source database file not found")
            try:
                # Create parent directory if it doesn't exist
                os.makedirs(os.path.dirname(value), exist_ok=True)
                # Copy the database file
                shutil.copy2(old_value, value)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to migrate database: {str(e)}")
    
    # Handle image path change
    elif key == "image_path" and old_value and old_value != value:
        if migrate:
            if not os.path.exists(old_value):
                raise HTTPException(status_code=404, detail="Source images directory not found")
            try:
                # Create new images directory
                os.makedirs(value, exist_ok=True)
                # Copy all files and subdirectories
                for item in os.listdir(old_value):
                    s = os.path.join(old_value, item)
                    d = os.path.join(value, item)
                    if os.path.isdir(s):
                        shutil.copytree(s, d, dirs_exist_ok=True)
                    else:
                        shutil.copy2(s, d)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to migrate images: {str(e)}")
    
    # Update the config
    config[key] = value
    save_config(config)
    
    # If this is a path change, schedule a restart
    if key in ["database_path", "image_path"] and old_value != value:
        if background_tasks:
            background_tasks.add_task(restart_backend)
    
    return {key: value}

def restart_backend():
    """Restart the backend server"""
    python = sys.executable
    os.execl(python, python, *sys.argv)