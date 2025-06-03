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
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterReadingStatus, setFilterReadingStatus] = useState<string[]>([]);
  const [filterOverallStatus, setFilterOverallStatus] = useState<string[]>([]);
  const [ratingRange, setRatingRange] = useState<number[]>([0, 5]);

  const [showSecondaryFabs, setShowSecondaryFabs] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const limit = 10;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const fetchMangas = async (reset = false) => {
    try {
      const nextPage = reset ? 1 : page;
      const newMangas = await getMangas(nextPage, limit, searchQuery, sortOrder);
      setMangas((prevMangas) =>
        reset ? newMangas : [...prevMangas, ...newMangas]
      );
      setPage(nextPage + 1);
      if (newMangas.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error("Failed to fetch mangas", error);
      setHasMore(false);
    }
  };

  useEffect(() => {
    setMangas([]);
    setPage(1);
    setHasMore(true);
    fetchMangas(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortOrder]);

  const fetchMoreMangas = async () => {
    fetchMangas();
  };

  const resetFilters = () => {
    setFilterCategory([]);
    setFilterReadingStatus([]);
    setFilterOverallStatus([]);
    setRatingRange([0, 5]);
    setSearchQuery("");
    setSortOrder("asc");
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        marginTop: { xs: 0, md: 2, lg: 2, xl: 2 },
      }}
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
      <Box sx={{ overflowY: "auto", height: "100vh" }}>
        <InfiniteScroll
          dataLength={mangas.length}
          next={fetchMoreMangas}
          hasMore={hasMore}
          scrollThreshold={0.9}
          loader={<></>}
        >
          <MangaList mangas={mangas} isMobile={isMobile} />
        </InfiniteScroll>
      </Box>

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
              onClick={() => navigate("/create-manga")}
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
