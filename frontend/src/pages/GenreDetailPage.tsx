import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getGenreById, getMangasByGenreId } from "../services/genreService";
import { Genre, Manga } from "../api/models";
import MangaList from "../components/MangaList";

const GenreDetailPage: React.FC = () => {
  const { genreId } = useParams<{ genreId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [genre, setGenre] = useState<Genre | null>(null);
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenreData = async () => {
      try {
        setLoading(true);
        if (genreId) {
          const genreResponse = await getGenreById(Number(genreId));
          setGenre(genreResponse);
          const mangasResponse = await getMangasByGenreId(Number(genreId));
          setMangas(mangasResponse || []);
        }
      } catch (error) {
        console.error("Error fetching genre data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenreData();
  }, [genreId]);

  const handleBack = () => {
    navigate("/genres");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!genre) {
    return (
      <Container maxWidth="lg">
        <Box p={3}>
          <Typography variant="h5">Genre not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box p={isMobile ? 2 : 3}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: isMobile ? 2 : 3, 
            mb: 4, 
            backgroundColor: 'transparent',
            borderRadius: 2
          }}
        >
          <Box display="flex" alignItems="center" mb={3}>
            <IconButton 
              onClick={handleBack}
              sx={{ 
                mr: 2,
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {genre.name}
            </Typography>
          </Box>

          {mangas.length === 0 ? (
            <Box 
              textAlign="center" 
              py={8} 
              sx={{ 
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No mangas found in this genre
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Add mangas with this genre to see them here
              </Typography>
            </Box>
          ) : (
            <MangaList mangas={mangas} isMobile={isMobile} />
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default GenreDetailPage; 