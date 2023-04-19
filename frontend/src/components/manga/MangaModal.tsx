import { Button, Modal } from "@mui/material";
import { Manga, Author, Genre } from "../../api/models";

interface Props {
  manga: Manga;
  open: boolean;
  onClose: () => void;
}

export default function MangaModal({ manga, open, onClose }: Props) {
  const imageUrl = `/static/images/${manga.title.replace(":", "")}_cover.jpg`;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>{manga.title}</h2>
          <Button onClick={onClose}>X</Button>
        </div>
        <div className="modal-content">
          <img className="modal-cover" src={imageUrl} alt="mangacover" />
          <div className="modal-text">
            <p>
              <strong>Authors:</strong>{" "}
              {manga.authors
                .map((author: Author) => `${author.name} (${author.role})`)
                .join(", ")}
            </p>
            <p>
              <strong>Genres:</strong>{" "}
              {manga.genres.map((genre: Genre) => genre.name).join(", ")}
            </p>
            <p>{manga.description}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
