import gzip
import logging
import xml.etree.ElementTree as ET

from fastapi import UploadFile
from sqlalchemy.orm import Session

from backend.app.handlers.jikan import JikanHandler
from backend.app.repositories.manga import MangaRepository
from backend.app.schemas import ImportResponse, ReadingStatus

logger = logging.getLogger(__name__)


class MALImporter:
    def __init__(self, db: Session):
        self.db = db
        self.jikan = JikanHandler()

    async def import_list(self, file: UploadFile) -> ImportResponse:
        total = 0
        imported = 0
        failed = 0
        errors = []

        try:
            # Read the file content
            content = await file.read()

            # Try to decompress if it's gzipped
            try:
                xml_content = gzip.decompress(content)
            except gzip.BadGzipFile:
                # If not gzipped, assume it's plain XML
                xml_content = content

            # Parse XML
            try:
                root = ET.fromstring(xml_content)
            except ET.ParseError as e:
                return ImportResponse(
                    total=0,
                    imported=0,
                    failed=0,
                    errors=[f"Invalid XML file: {str(e)}"],
                )

            mangas = root.findall("manga")
            total = len(mangas)

            for manga_elem in mangas:
                title_elem = manga_elem.find("manga_title")
                title = title_elem.text if title_elem is not None else "Unknown"
                if title:
                    title = title.strip()

                try:
                    # Check if exists
                    existing = MangaRepository.get_by_title(self.db, title)
                    if existing:
                        # Skip if exists
                        continue

                    # Fetch details from Jikan
                    mal_id_elem = manga_elem.find("manga_mangadb_id")
                    mal_id = mal_id_elem.text if mal_id_elem is not None else None

                    manga_create = None

                    # Try by ID first
                    if mal_id:
                        try:
                            manga_create = self.jikan.scrape(mal_id)
                        except Exception as e:
                            logger.warning(f"Failed to fetch by ID {mal_id}: {e}")

                    # If failed by ID, try search by title
                    if not manga_create:
                        try:
                            results = self.jikan.search(title)
                            if results:
                                manga_create = results[0]
                        except Exception as e:
                            logger.warning(f"Failed to search by title {title}: {e}")

                    if not manga_create:
                        errors.append(f"Could not find details for '{title}'")
                        failed += 1
                        continue

                    # Enrich with MAL data
                    my_score_elem = manga_elem.find("my_score")
                    if my_score_elem is not None and my_score_elem.text:
                        try:
                            score = int(my_score_elem.text)
                            if score > 0:
                                manga_create.star_rating = float(score) / 2.0
                        except ValueError:
                            pass

                    my_status_elem = manga_elem.find("my_status")
                    if my_status_elem is not None and my_status_elem.text:
                        status_map = {
                            "Reading": ReadingStatus.in_progress,
                            "Completed": ReadingStatus.completed,
                            "On-Hold": ReadingStatus.on_hold,
                            "Dropped": ReadingStatus.dropped,
                            "Plan to Read": ReadingStatus.not_started,
                        }
                        manga_create.reading_status = status_map.get(
                            my_status_elem.text, ReadingStatus.not_started
                        )

                    # Create in DB
                    MangaRepository.create(self.db, manga_create)
                    imported += 1

                except Exception as e:
                    logger.error(f"Error importing manga '{title}': {e}")
                    errors.append(f"Error importing '{title}': {str(e)}")
                    failed += 1

        except Exception as e:
            logger.error(f"Fatal error during import: {e}")
            errors.append(f"Fatal error: {str(e)}")
            failed = total - imported  # Approximate

        return ImportResponse(
            total=total, imported=imported, failed=failed, errors=errors
        )
