from fastapi import APIRouter, HTTPException
from typing import Dict
from backend.config import load_config, save_config

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
def create_or_update_setting(key: str, value: str):
    config = load_config()
    config[key] = value
    save_config(config)
    return {key: value}