# type: ignore

import os
import time
import platform
import requests

from urllib.parse import urljoin
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from typing import List, Dict

from backend.app import settings
from backend.app.schemas import AuthorCreate, Category, GenreCreate, MangaCreate
from backend.app.chromedriver_util import download_and_extract_chromedriver

from .base import BaseHandler


class MangaPassionHandler(BaseHandler):
    def __init__(self, base_url: str):
        super().__init__(base_url)

        chrome_driver_path = os.path.join(
            os.getcwd(),
            "chromedriver" + (".exe" if platform.system() == "Windows" else ""),
        )
        if not os.path.exists(chrome_driver_path):
            download_and_extract_chromedriver()

        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920x1080")
        self.driver = webdriver.Chrome(
            service=Service(chrome_driver_path), options=chrome_options
        )

    def search(self, search_term: str) -> List[Dict[str, str]]:
        search_url = f"{self.base_url}/search?q={search_term}"
        self.driver.get(search_url)

        WebDriverWait(self.driver, 10).until(
            EC.presence_of_all_elements_located(
                (By.CSS_SELECTOR, ".manga-list_listItemWrapper__bwhIS")
            )
        )

        time.sleep(1)

        soup = BeautifulSoup(self.driver.page_source, "html.parser")
        results = []

        manga_results = soup.select(".manga-list_listItemWrapper__bwhIS")
        print(f"Found {len(manga_results)} manga results")

        for item in manga_results[:5]:
            link_element = item.find("a", href=True)
            title_element = item.find(class_="manga-list_title__GKlEd")

            if link_element and title_element:
                title = title_element.text.strip()
                link = link_element["href"]
                print(f"Title element found: {title}")
                print(f"Link element found: {link}")
                results.append({"title": title, "link": f"{self.base_url}{link}"})
            else:
                print("Skipping item due to missing title or link element")

        print(f"Results: {results}")
        return results

    def scrape(self, url: str) -> MangaCreate:
        self.driver.get(url)

        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "h1"))
        )

        soup = BeautifulSoup(self.driver.page_source, "html.parser")

        title_element = soup.find("h1")
        if not title_element:
            raise ValueError("Title not found on the page")
        title = title_element.text.strip()

        authors = []
        genres = []

        details_sections = soup.select("ul.manga_details__UYMcm")
        for section in details_sections:
            section_text = section.text
            if "Autor" in section_text:
                authors.extend(
                    [author.text.strip() for author in section.find_all("a")]
                )
            elif "Zeichner" in section_text:
                authors.extend(
                    [author.text.strip() for author in section.find_all("a")]
                )
            elif "Genres" in section_text:
                genres.extend([genre.text.strip() for genre in section.find_all("a")])

        summary_element = soup.find("div", class_="manga_description__vzPCx")
        summary = ""
        if summary_element:
            paragraph = summary_element.find("p")
            if paragraph:
                summary = paragraph.text.strip()
        if not summary:
            print("Summary element not found, checking for alternative structure...")
            alternative_summary_element = soup.find("meta", {"name": "description"})
            if not alternative_summary_element:
                print(f"Page source: {soup.prettify()}")
                raise ValueError("Summary not found on the page")
            summary = alternative_summary_element["content"].strip()

        cover_image_element = soup.find("img", class_="img_img__jkdIh")
        if not cover_image_element or not cover_image_element.get("src"):
            raise ValueError("Cover image not found on the page")
        cover_image_url = cover_image_element["src"]

        # Ensure the cover_image_url has the scheme
        if not cover_image_url.startswith("http"):
            cover_image_url = urljoin(self.base_url, cover_image_url)

        image_save_path = settings.IMAGE_SAVE_PATH
        if not os.path.exists(image_save_path):
            os.makedirs(image_save_path)

        image_filename = os.path.join(image_save_path, f"{title}.jpg")
        response = requests.get(cover_image_url)
        if response.status_code == 200:
            with open(image_filename, "wb") as f:
                f.write(response.content)
        else:
            raise ValueError("Failed to download cover image")

        manga_create = MangaCreate(
            title=title,
            japanese_title=None,
            summary=summary,
            star_rating=None,
            category=Category.manga,
            cover_image=image_filename,
            authors=[AuthorCreate(name=author) for author in list(set(authors))],
            genres=[GenreCreate(name=genre) for genre in genres],
            lists=[],
            volumes=[],
        )

        return manga_create

    def __del__(self):
        if hasattr(self, "driver"):
            self.driver.quit()
