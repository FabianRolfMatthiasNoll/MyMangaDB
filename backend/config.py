import json

MYANIMELIST_ACCESS_TOKEN = ''


def read_token_json():
    global MYANIMELIST_ACCESS_TOKEN
    with open('../token.json', 'r') as f:
        data = json.load(f)
        MYANIMELIST_ACCESS_TOKEN = data["token"]


def read():
    read_token_json()
