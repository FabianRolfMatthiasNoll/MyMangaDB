import { components, operations } from "./api-types";
import { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";

type Manga = components["schemas"]["Manga"];
const API_URL = "http://localhost:8000";

const MangaList: React.FC = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllMangas = async () => {
      try {
        const response = await axios.get<Manga[]>(`${API_URL}/manga/`);
        setMangas(response.data);
        console.log("Received mangas:", response.data);
      } catch (error) {
        console.error("Error fetching mangas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMangas();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>All Mangas</h1>
      {mangas.map((manga, index) => (
        <div key={index}>
          <h2>{manga.title}</h2>
          <p>Description: {manga.description}</p>
          <p>Total Volumes: {manga.total_volumes}</p>
          <p>Genres: {manga.genres.map((genre) => genre.name).join(", ")}</p>
          <p>
            Authors:{" "}
            {manga.authors
              .map((author) => `${author.name} (${author.role})`)
              .join(", ")}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MangaList;
