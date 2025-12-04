import React, { useState, useEffect } from "react";
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
import { getMangas } from "../services/mangaService";
import { getAllLists } from "../services/listService";
import { ListModel } from "../api/models";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTheme } from "@mui/material/styles";
import SearchBar from "../components/SearchBar";
import AdvancedFilters from "../components/AdvancedFilters";
import MangaList from "../components/MangaList";
import AutomaticSearchModal from "../components/AutomaticSearchModal";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterReadingStatus, setFilterReadingStatus] = useState<string[]>([]);
  const [filterOverallStatus, setFilterOverallStatus] = useState<string[]>([]);
  const [ratingRange, setRatingRange] = useState<number[]>([0, 5]);
  const [filterList, setFilterList] = useState<ListModel | null>(null);

  const { data: availableLists = [] } = useQuery({
    queryKey: ["lists"],
    queryFn: getAllLists,
  });

  const [showSecondaryFabs, setShowSecondaryFabs] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const limit = 20;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const { data, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery({
    queryKey: ["mangas", searchQuery, sortOrder, filterList],
    queryFn: ({ pageParam = 1 }) => {
      let effectiveSearch = searchQuery;
      if (filterList) {
        effectiveSearch = `list:${filterList.name}`;
      }
      return getMangas(pageParam, limit, effectiveSearch, sortOrder);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const mangas = data ? data.pages.flat() : [];

  const resetFilters = () => {
    setFilterCategory([]);
    setFilterReadingStatus([]);
    setFilterOverallStatus([]);
    setRatingRange([0, 5]);
    setFilterList(null);
    setSearchQuery("");
    setSortOrder("asc");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)", // Subtract header height
        overflow: "hidden",
        width: "100%",
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 2, sm: 3 },
          pb: 2,
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
            availableLists={availableLists}
            filterList={filterList}
            setFilterList={setFilterList}
            resetFilters={resetFilters}
          />
        )}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            mt: 2,
            width: "100%",
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
            dataLength={mangas.length}
            next={fetchNextPage}
            hasMore={!!hasNextPage}
            scrollThreshold={0.9}
            loader={<></>}
          >
            <MangaList mangas={mangas} isMobile={isMobile} />
          </InfiniteScroll>
        </Box>
      </Container>

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
        onMangaAdded={() => {
          refetch();
        }}
      />
    </Box>
  );
};

export default Dashboard;
