import React, { useEffect, useState } from "react";
import { Container, Grid, Box, CircularProgress } from "@mui/material";
import MangaCard from "../components/MangaCard";
import { getMangas, getMangaCoverImageUrl } from "../services/apiService";
import { Manga } from "../api/models";
import InfiniteScroll from "react-infinite-scroll-component";

const Dashboard: React.FC = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const limit = 10;

  useEffect(() => {
    const fetchInitialMangas = async () => {
      try {
        const initialMangas = await getMangas(1, limit);
        setMangas(initialMangas);
        setPage(2);
        if (initialMangas.length < limit) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to fetch mangas", error);
      }
    };

    fetchInitialMangas();
  }, []);

  const fetchMoreMangas = async () => {
    try {
      const newMangas = await getMangas(page, limit);
      setMangas((prevMangas) => [...prevMangas, ...newMangas]);
      setPage(page + 1);
      if (newMangas.length < limit) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch more mangas", error);
      setHasMore(false);
    }
  };

  return (
    <Container sx={{ marginTop: 5 }}>
      <InfiniteScroll
        dataLength={mangas.length}
        next={fetchMoreMangas}
        hasMore={hasMore}
        loader={
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        }
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>You have seen it all</b>
          </p>
        }
      >
        <Grid container spacing={3}>
          {mangas.map((manga) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={manga.id}>
              <MangaCard manga={manga} getImageUrl={getMangaCoverImageUrl} />
            </Grid>
          ))}
        </Grid>
      </InfiniteScroll>
    </Container>
  );
};

export default Dashboard;
