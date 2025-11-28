import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getGenres } from "../services/genreService";
import { Genre } from "../api/models";

const GenresPage: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const response = await getGenres();
      setGenres(response);
    } catch (error) {
      console.error("Error fetching genres:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleGenreClick = (genreId: number) => {
    navigate(`/genres/${genreId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box p={isMobile ? 2 : 3}>
        <Paper elevation={0} sx={{ p: isMobile ? 2 : 3, mb: 4, backgroundColor: 'transparent' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bold' }}>
              Genres
            </Typography>
          </Box>

          {genres.length === 0 ? (
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
                No genres found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Genres will be added automatically when you add manga
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={isMobile ? 2 : 3}>
              {genres.map((genre) => (
                <Grid item xs={12} sm={6} md={4} key={genre.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: isMobile ? 2 : 3,
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4
                      }
                    }}
                    onClick={() => handleGenreClick(genre.id)}
                  >
                    <Box>
                      <Typography
                        variant={isMobile ? "subtitle1" : "h6"}
                        sx={{
                          fontWeight: 'bold',
                          mb: 1
                        }}
                      >
                        {genre.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        {genre.mangaCount} manga{genre.mangaCount !== 1 ? "s" : ""}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default GenresPage;
