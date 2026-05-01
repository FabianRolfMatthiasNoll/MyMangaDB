import React from "react";
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
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTranslation } from "react-i18next";

const GenresPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const limit = 20;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["genres"],
    queryFn: ({ pageParam = 0 }) => getGenres(pageParam, limit),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length * limit : undefined;
    },
    initialPageParam: 0,
  });

  const genres = data ? data.pages.flat() : [];

  const handleGenreClick = (genreId: number) => {
    navigate(`/genres/${genreId}`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{t("errors.errorLoadingGenres")}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box p={isMobile ? 2 : 3}>
        <Paper elevation={0} sx={{ p: isMobile ? 2 : 3, mb: 4, backgroundColor: 'transparent' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bold' }}>
              {t("genres.title")}
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
                {t("genres.noGenresFound")}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t("genres.genresAutoAdded")}
              </Typography>
            </Box>
          ) : (
            <Box
              id="scrollableDiv"
              sx={{
                maxHeight: "calc(100vh - 200px)",
                overflow: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  background:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.2)",
                  borderRadius: "4px",
                },
              }}
            >
              <InfiniteScroll
                dataLength={genres.length}
                next={fetchNextPage}
                hasMore={!!hasNextPage}
                scrollThreshold={0.9}
                loader={<></>}
                scrollableTarget="scrollableDiv"
              >
                <Grid container spacing={isMobile ? 2 : 3}>
                  {genres.map((genre) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={genre.id}>
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
              </InfiniteScroll>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default GenresPage;
