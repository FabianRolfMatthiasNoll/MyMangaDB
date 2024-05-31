import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Box,
  useMediaQuery,
  List,
  ListItem,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import MangaCard from "../components/MangaCard";
import { getMangas, getMangaCoverImageUrl } from "../services/apiService";
import { Manga } from "../api/models";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTheme } from "@mui/material/styles";

const Dashboard: React.FC = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const limit = 10;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    <Container
      maxWidth={false}
      sx={{ marginTop: { xs: 0, md: 2, lg: 2, xl: 2 } }}
    >
      <InfiniteScroll
        dataLength={mangas.length}
        next={fetchMoreMangas}
        hasMore={hasMore}
        scrollThreshold={0.9}
        loader={<></>}
        // loader={
        //   <Box
        //     sx={{
        //       display: "flex",
        //       justifyContent: "center",
        //       alignItems: "center",
        //     }}
        //   >
        //     <CircularProgress />
        //   </Box>
        // }
        // endMessage={
        //   <p style={{ textAlign: "center" }}>
        //     <b>You have seen it all</b>
        //   </p>
        // }
        height="100vh"
      >
        {isMobile ? (
          <List>
            {mangas.map((manga) => (
              <ListItem key={manga.id}>
                <Card sx={{ width: "100%", display: "flex", height: "100px" }}>
                  <CardMedia
                    component="img"
                    image={getMangaCoverImageUrl(manga.coverImage || "")}
                    alt="manga cover"
                    sx={{ width: "auto", height: "100px" }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      ml: 2,
                      overflow: "hidden",
                    }}
                  >
                    <CardContent
                      sx={{
                        flex: "1 0 auto",
                        padding: "8px 0",
                        overflow: "hidden",
                      }}
                    >
                      <Typography variant="body1" noWrap>
                        {manga.title}
                      </Typography>
                      <Typography variant="body2" noWrap>
                        {manga.authors.map((author) => author.name).join(", ")}
                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              </ListItem>
            ))}
          </List>
        ) : (
          <Grid container spacing={2}>
            {mangas.map((manga) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={manga.id}>
                <MangaCard manga={manga} getImageUrl={getMangaCoverImageUrl} />
              </Grid>
            ))}
          </Grid>
        )}
      </InfiniteScroll>
    </Container>
  );
};

export default Dashboard;
