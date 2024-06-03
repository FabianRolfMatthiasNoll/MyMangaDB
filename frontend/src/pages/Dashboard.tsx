import React, { useEffect, useState } from "react";
import {
  Container,
  useMediaQuery,
  Fab,
  Zoom,
  Box,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { getMangas } from "../services/apiService";
import { Manga } from "../api/models";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTheme } from "@mui/material/styles";
import SearchBar from "../components/SearchBar";
import AdvancedFilters from "../components/AdvancedFilters";
import MangaList from "../components/MangaList";
import AutomaticSearchModal from "../components/AutomaticSearchModal";

const Dashboard: React.FC = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [filteredMangas, setFilteredMangas] = useState<Manga[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterReadingStatus, setFilterReadingStatus] = useState<string[]>([]);
  const [filterOverallStatus, setFilterOverallStatus] = useState<string[]>([]);
  const [ratingRange, setRatingRange] = useState<number[]>([0, 5]);

  const [showSecondaryFabs, setShowSecondaryFabs] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

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

  useEffect(() => {
    let filtered = [...mangas];

    if (searchQuery) {
      filtered = filtered.filter(
        (manga) =>
          manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          manga.authors.some((author) =>
            author.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          manga.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          manga.genres.some((genre) =>
            genre.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (filterCategory.length) {
      filtered = filtered.filter(
        (manga) => manga.category && filterCategory.includes(manga.category)
      );
    }

    if (filterReadingStatus.length) {
      filtered = filtered.filter(
        (manga) =>
          manga.readingStatus &&
          filterReadingStatus.includes(manga.readingStatus)
      );
    }

    if (filterOverallStatus.length) {
      filtered = filtered.filter(
        (manga) =>
          manga.overallStatus &&
          filterOverallStatus.includes(manga.overallStatus)
      );
    }

    filtered = filtered.filter(
      (manga) =>
        (manga.starRating ?? 0) >= ratingRange[0] &&
        (manga.starRating ?? 0) <= ratingRange[1]
    );

    filtered.sort((a, b) => {
      const fieldA = a.title;
      const fieldB = b.title;

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortOrder === "asc"
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }

      return 0;
    });

    setFilteredMangas(filtered);
  }, [
    mangas,
    searchQuery,
    sortOrder,
    filterCategory,
    filterReadingStatus,
    filterOverallStatus,
    ratingRange,
  ]);

  const resetFilters = () => {
    setFilterCategory([]);
    setFilterReadingStatus([]);
    setFilterOverallStatus([]);
    setRatingRange([0, 5]);
  };

  return (
    <Container
      maxWidth={false}
      sx={{ marginTop: { xs: 0, md: 2, lg: 2, xl: 2 } }}
    >
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        toggleAdvancedFilters={() =>
          setShowAdvancedFilters(!showAdvancedFilters)
        }
      />
      {showAdvancedFilters && (
        <AdvancedFilters
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterReadingStatus={filterReadingStatus}
          setFilterReadingStatus={setFilterReadingStatus}
          filterOverallStatus={filterOverallStatus}
          setFilterOverallStatus={setFilterOverallStatus}
          ratingRange={ratingRange}
          setRatingRange={setRatingRange}
          resetFilters={resetFilters}
        />
      )}
      <InfiniteScroll
        dataLength={filteredMangas.length}
        next={fetchMoreMangas}
        hasMore={hasMore}
        scrollThreshold={0.9}
        loader={<></>}
        height="100vh"
      >
        <MangaList mangas={filteredMangas} isMobile={isMobile} />
      </InfiniteScroll>

      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          "&:hover .secondary-fab": {
            visibility: "visible",
            opacity: 1,
          },
        }}
        onMouseEnter={() => setShowSecondaryFabs(true)}
        onMouseLeave={() => setShowSecondaryFabs(false)}
      >
        <Zoom in={showSecondaryFabs} style={{ transitionDelay: "100ms" }}>
          <Tooltip title="Manual" placement="left">
            <Fab
              color="secondary"
              aria-label="manual"
              size="small"
              className="secondary-fab"
              sx={{
                mb: 1,
                visibility: "hidden",
                opacity: 0,
                transition: "visibility 0.2s, opacity 0.2s",
              }}
            >
              <EditIcon />
            </Fab>
          </Tooltip>
        </Zoom>
        <Zoom in={showSecondaryFabs} style={{ transitionDelay: "200ms" }}>
          <Tooltip title="Automatic" placement="left">
            <Fab
              color="secondary"
              aria-label="automatic"
              size="small"
              className="secondary-fab"
              sx={{
                mb: 1,
                visibility: "hidden",
                opacity: 0,
                transition: "visibility 0.2s, opacity 0.2s",
              }}
              onClick={() => setShowModal(true)}
            >
              <AutorenewIcon />
            </Fab>
          </Tooltip>
        </Zoom>
        <Zoom in={true}>
          <Fab color="primary" aria-label="add">
            <AddIcon />
          </Fab>
        </Zoom>
      </Box>

      <AutomaticSearchModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </Container>
  );
};

export default Dashboard;
