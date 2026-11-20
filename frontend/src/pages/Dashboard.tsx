import React, { useEffect, useState } from "react";
import {
  Container,
  useMediaQuery,
  Fab,
  Zoom,
  Box,
  Tooltip,
  Alert,
  Button,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { getMangas, MangaQuery } from "../services/mangaService";
import { getAllLists } from "../services/listService";
import { ListModel } from "../api/models";
import { useShowWishlistInDashboard } from "../hooks/useShowWishlistInDashboard";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTheme } from "@mui/material/styles";
import SearchBar from "../components/SearchBar";
import AdvancedFilters from "../components/AdvancedFilters";
import MangaList from "../components/MangaList";
import AutomaticSearchModal from "../components/AutomaticSearchModal";
import { useNavigate } from "react-router-dom";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { invalidateMangaQueries } from "../services/queryInvalidation";
import { useUser } from "../context/UserContext";
import { useTranslation } from "react-i18next";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { isAdmin } = useUser();
  const [searchQuery, setSearchQuery] = useState<string>("");
  // The search text goes into the query key, so every keystroke would
  // send a request. The request waits for a moment of quiet instead.
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterReadingStatus, setFilterReadingStatus] = useState<string[]>([]);
  const [filterOverallStatus, setFilterOverallStatus] = useState<string[]>([]);
  const [filterOwnershipStatus, setFilterOwnershipStatus] = useState<string[]>(
    [],
  );
  const [ratingRange, setRatingRange] = useState<number[]>([0, 5]);
  const [filterList, setFilterList] = useState<ListModel | null>(null);
  const { showWishlist, toggle: toggleWishlist } = useShowWishlistInDashboard();

  const { data: availableLists = [] } = useQuery({
    queryKey: ["lists"],
    queryFn: getAllLists,
  });

  const queryClient = useQueryClient();

  const [showSecondaryFabs, setShowSecondaryFabs] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const limit = 20;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const { data, fetchNextPage, hasNextPage, refetch, isError, isLoading } =
    useInfiniteQuery({
      queryKey: [
        "mangas",
        debouncedSearchQuery,
        sortOrder,
        filterList,
        filterCategory,
        filterReadingStatus,
        filterOverallStatus,
        filterOwnershipStatus,
        ratingRange,
        showWishlist,
      ],
      queryFn: ({ pageParam = 1 }) => {
        const query: MangaQuery = {
          page: pageParam,
          limit,
          search: debouncedSearchQuery,
          sort: sortOrder,
          categories: filterCategory.length > 0 ? filterCategory : undefined,
          readingStatuses:
            filterReadingStatus.length > 0 ? filterReadingStatus : undefined,
          overallStatuses:
            filterOverallStatus.length > 0 ? filterOverallStatus : undefined,
          ratingMin: ratingRange[0],
          ratingMax: ratingRange[1],
          listId: filterList?.id,
        };

        if (filterOwnershipStatus.length > 0) {
          // An explicit ownership filter always wins.
          query.ownershipStatuses = filterOwnershipStatus;
        } else {
          // The dashboard shows the collection. The titles that are only
          // wanted stay out unless the user asks for them - a title you
          // already own a volume of stays.
          query.hidePureWishes = !showWishlist;
        }

        return getMangas(query);
      },
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === limit ? allPages.length + 1 : undefined;
      },
      initialPageParam: 1,
      // The error is surfaced in the UI, so retrying silently would only
      // delay the message and repeat it for every attempt.
      retry: false,
    });

  const mangas = data ? data.pages.flat() : [];

  const resetFilters = () => {
    setFilterCategory([]);
    setFilterReadingStatus([]);
    setFilterOverallStatus([]);
    setFilterOwnershipStatus([]);
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
          <Box
            sx={{
              // The filter panel sits above the grid. Without a cap it
              // pushes the grid out of the viewport on a short screen, and
              // the collection disappears behind the overflow.
              maxHeight: { xs: "35vh", md: "45vh" },
              overflowY: "auto",
              pr: 1,
              mb: 2,
            }}
          >
            <AdvancedFilters
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterReadingStatus={filterReadingStatus}
              setFilterReadingStatus={setFilterReadingStatus}
              filterOverallStatus={filterOverallStatus}
              setFilterOverallStatus={setFilterOverallStatus}
              ratingRange={ratingRange}
              setRatingRange={setRatingRange}
              filterOwnershipStatus={filterOwnershipStatus}
              setFilterOwnershipStatus={setFilterOwnershipStatus}
              showWishlist={showWishlist}
              onToggleWishlist={toggleWishlist}
              availableLists={availableLists}
              filterList={filterList}
              setFilterList={setFilterList}
              resetFilters={resetFilters}
            />
          </Box>
        )}
        <Box
          id="scrollableDiv"
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
          {isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => refetch()}>
                  {t("common.retry")}
                </Button>
              }
            >
              {t("common.errorLoading")}
            </Alert>
          ) : isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 6,
              }}
            >
              <CircularProgress />
            </Box>
          ) : mangas.length === 0 ? (
            <Alert severity="info">{t("dashboard.nothingHere")}</Alert>
          ) : (
            <InfiniteScroll
              dataLength={mangas.length}
              next={fetchNextPage}
              hasMore={!!hasNextPage}
              scrollThreshold={0.9}
              loader={<></>}
              scrollableTarget="scrollableDiv"
            >
              <MangaList mangas={mangas} isMobile={isMobile} />
            </InfiniteScroll>
          )}
        </Box>
      </Container>

      {/* Only an admin may add titles. Showing the button to a guest would
          send them to a page they are not allowed to see. */}
      {isAdmin && (
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Zoom in={showSecondaryFabs} style={{ transitionDelay: "100ms" }}>
            <Tooltip title={t("dashboard.manual")} placement="left">
              <Fab
                color="secondary"
                aria-label={t("dashboard.manual")}
                size="small"
                sx={{ mb: 1 }}
                onClick={() => navigate("/create-manga")}
              >
                <EditIcon />
              </Fab>
            </Tooltip>
          </Zoom>
          <Zoom in={showSecondaryFabs} style={{ transitionDelay: "200ms" }}>
            <Tooltip title={t("dashboard.automatic")} placement="left">
              <Fab
                color="secondary"
                aria-label={t("dashboard.automatic")}
                size="small"
                sx={{ mb: 1 }}
                onClick={() => setShowModal(true)}
              >
                <AutorenewIcon />
              </Fab>
            </Tooltip>
          </Zoom>
          <Zoom in={true}>
            <Fab
              color="primary"
              aria-label={t("dashboard.addManga")}
              onClick={() => setShowSecondaryFabs(!showSecondaryFabs)}
            >
              <AddIcon />
            </Fab>
          </Zoom>
        </Box>
      )}

      <AutomaticSearchModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onMangaAdded={() => {
          invalidateMangaQueries(queryClient);
        }}
      />
    </Box>
  );
};

export default Dashboard;
