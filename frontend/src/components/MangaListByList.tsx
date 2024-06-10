import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { getMangasByListId } from "../services/apiService";
import { Manga } from "../api/models";
import MangaList from "../components/MangaList";

const MangaListByListId: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchMangas = async () => {
      if (listId) {
        try {
          const mangas = await getMangasByListId(Number(listId));
          setMangas(mangas);
        } catch (error) {
          console.error("Failed to fetch mangas", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMangas();
  }, [listId]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Mangas in List
      </Typography>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <MangaList mangas={mangas} isMobile={isMobile} />
      )}
    </Container>
  );
};

export default MangaListByListId;
