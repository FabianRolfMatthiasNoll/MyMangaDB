import json
import os
import platform
import shutil
import subprocess
import urllib.request
import zipfile
from tempfile import TemporaryDirectory

CHROMEDRIVER_URL = (
    "https://googlechromelabs.github.io/chrome-for-testing/"
    "known-good-versions-with-downloads.json"
)


def get_chrome_version():
    """Returns the installed Chrome version."""
    if platform.system() == "Windows":
        process = subprocess.run(
            r'reg query "HKEY_CURRENT_USER\Software\Google\Chrome\BLBeacon" /v version',
            capture_output=True,
            text=True,
            shell=True,
        )
        version = process.stdout.strip().split()[-1]
    elif platform.system() == "Darwin":
        process = subprocess.run(
            [
                "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                "--version",
            ],
            capture_output=True,
            text=True,
        )
        version = process.stdout.strip().split()[-1]
    else:
        process = subprocess.run(
            ["google-chrome", "--version"],
            capture_output=True,
            text=True,
        )
        version = process.stdout.strip().split()[-1]

    return version


def get_latest_chromedriver_url(chrome_version):
    with urllib.request.urlopen(CHROMEDRIVER_URL) as response:
        data = json.load(response)

    # Find the closest matching ChromeDriver version
    major_version = chrome_version.split(".")[0]
    for version_data in reversed(data["versions"]):
        if version_data["version"].startswith(major_version):
            latest_version = version_data
            break

    platform_name = platform.system()

    if platform_name == "Linux":
        platform_key = "linux64"
    elif platform_name == "Darwin":
        if platform.machine() == "arm64":
            platform_key = "mac-arm64"
        else:
            platform_key = "mac-x64"
    elif platform_name == "Windows":
        if platform.architecture()[0] == "64bit":
            platform_key = "win64"
        else:
            platform_key = "win32"
    else:
        raise Exception("Unsupported OS")

    download_url = None
    for driver in latest_version["downloads"]["chromedriver"]:
        if driver["platform"] == platform_key:
            download_url = driver["url"]
            break

    if not download_url:
        raise Exception(f"No download URL found for platform: {platform_key}")

    return download_url


def download_and_extract_chromedriver():
    chrome_version = get_chrome_version()
    url = get_latest_chromedriver_url(chrome_version)
    print(f"Downloading ChromeDriver from {url}")

    driver_zip_path = os.path.join(os.getcwd(), "chromedriver.zip")
    urllib.request.urlretrieve(url, driver_zip_path)

    with TemporaryDirectory() as temp_dir:
        with zipfile.ZipFile(driver_zip_path, "r") as zip_ref:
            zip_ref.extractall(temp_dir)

        # Move chromedriver executable to the current working directory
        for root, _, files in os.walk(temp_dir):
            for file in files:
                if file == "chromedriver" or file == "chromedriver.exe":
                    shutil.move(os.path.join(root, file), os.getcwd())

    os.remove(driver_zip_path)
    print("ChromeDriver downloaded and extracted successfully.")
