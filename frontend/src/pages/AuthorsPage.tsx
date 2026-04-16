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
import { getAuthors } from "../services/authorService";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";

const AuthorsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const limit = 20;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["authors"],
    queryFn: ({ pageParam = 0 }) => getAuthors(pageParam, limit),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length * limit : undefined;
    },
    initialPageParam: 0,
  });

  const authors = data ? data.pages.flat() : [];

  const handleAuthorClick = (authorId: number) => {
    navigate(`/authors/${authorId}`);
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography color="error">Error loading authors</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box p={isMobile ? 2 : 3}>
        <Paper elevation={0} sx={{ p: isMobile ? 2 : 3, mb: 4, backgroundColor: 'transparent' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bold' }}>
              Authors
            </Typography>
          </Box>

          {authors.length === 0 ? (
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
                No authors found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Authors will be added automatically when you add manga
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
                dataLength={authors.length}
                next={fetchNextPage}
                hasMore={!!hasNextPage}
                scrollThreshold={0.9}
                loader={<></>}
                scrollableTarget="scrollableDiv"
              >
                <Grid container spacing={isMobile ? 2 : 3}>
                  {authors.map((author) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={author.id}>
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
                        onClick={() => handleAuthorClick(author.id)}
                      >
                        <Box>
                          <Typography
                            variant={isMobile ? "subtitle1" : "h6"}
                            sx={{
                              fontWeight: 'bold',
                              mb: 1
                            }}
                          >
                            {author.name}
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
                            {author.mangaCount} manga{author.mangaCount !== 1 ? "s" : ""}
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

export default AuthorsPage;
