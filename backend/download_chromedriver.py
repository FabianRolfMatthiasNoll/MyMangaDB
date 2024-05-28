import os
import platform
import urllib.request
import zipfile


def get_chromedriver():
    system = platform.system()
    base_url = "https://chromedriver.storage.googleapis.com/102.0.5005.61/"
    if system == "Linux":
        url = base_url + "chromedriver_linux64.zip"
    elif system == "Darwin":
        url = base_url + "chromedriver_mac64.zip"
    elif system == "Windows":
        url = base_url + "chromedriver_win32.zip"
    else:
        raise Exception("Unsupported OS")

    print(f"Downloading ChromeDriver from {url}")
    driver_zip_path = os.path.join(os.getcwd(), "chromedriver.zip")
    urllib.request.urlretrieve(url, driver_zip_path)

    with zipfile.ZipFile(driver_zip_path, "r") as zip_ref:
        zip_ref.extractall(os.getcwd())

    os.remove(driver_zip_path)
    print("ChromeDriver downloaded and extracted successfully.")


if __name__ == "__main__":
    get_chromedriver()
