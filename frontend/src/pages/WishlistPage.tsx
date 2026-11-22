import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Manga } from "../api/models";
import { getWishlistMangas } from "../services/wishlistService";
import {
  formatRelativeDate,
  isUnowned,
  missingVolumeCount,
  ownedVolumesOf,
} from "../utils/wishlist";
import WishlistCard from "../components/WishlistCard";

type SortOrder = "title" | "recent" | "missing";

const SORT_ORDERS: SortOrder[] = ["title", "recent", "missing"];

/**
 * The wishlist.
 *
 * It is not the collection with a filter applied - it answers different
 * questions: what do I want next, what is nearly finished and what have I
 * been putting off? So it has its own layout with three sections.
 */
const WishlistPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("title");
  const [tab, setTab] = useState(0);

  const {
    data: wishlist = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlistMangas,
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = term
      ? wishlist.filter(
          (manga) =>
            manga.title.toLowerCase().includes(term) ||
            manga.authors.some((author) =>
              author.name.toLowerCase().includes(term),
            ),
        )
      : wishlist;

    const sorted = [...matches];
    sorted.sort((left, right) => {
      if (sortOrder === "recent") {
        return (
          new Date(right.addedAt ?? 0).getTime() -
          new Date(left.addedAt ?? 0).getTime()
        );
      }
      if (sortOrder === "missing") {
        return missingVolumeCount(right) - missingVolumeCount(left);
      }
      return left.title.localeCompare(right.title);
    });

    // A prioritised title always comes first.
    return sorted.sort(
      (left, right) => Number(right.priority) - Number(left.priority),
    );
  }, [wishlist, search, sortOrder]);

  // Two groups, so that every title on the wishlist is in one of them: a
  // title you already own a volume of, and a title you do not own yet.
  // Without the second condition a title whose volumes are all owned would
  // fall through both groups and disappear from the page.
  const continuable = filtered.filter(
    (manga) => ownedVolumesOf(manga).length > 0,
  );
  const unowned = filtered.filter(isUnowned);

  // The newest wishes, shown as a quick strip at the top. They are also part
  // of the sections below - the strip is a shortcut, not a third bucket.
  const recent = useMemo(
    () =>
      [...filtered]
        .sort(
          (left, right) =>
            new Date(right.addedAt ?? 0).getTime() -
            new Date(left.addedAt ?? 0).getTime(),
        )
        .slice(0, 5),
    [filtered],
  );

  const sections = [
    {
      id: "continue",
      title: t("wishlist.continueSeries"),
      description: t("wishlist.continueSeriesDescription"),
      mangas: continuable,
    },
    {
      id: "new",
      title: t("wishlist.newToBuy"),
      description: t("wishlist.newToBuyDescription"),
      mangas: unowned,
    },
  ];

  const renderCards = (mangas: Manga[]) => {
    if (mangas.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          {t("wishlist.nothingHere")}
        </Typography>
      );
    }

    return (
      <Grid container spacing={2}>
        {mangas.map((manga) => (
          // The same widths as the collection, so that a title has the
          // same size on both pages.
          <Grid key={manga.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <WishlistCard manga={manga} />
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderSection = (section: (typeof sections)[number]) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6">{section.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {section.description}
      </Typography>
      {renderCards(section.mangas)}
    </Box>
  );

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
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
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4">{t("wishlist.title")}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t("wishlist.count", { count: wishlist.length })}
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            size="small"
            label={t("search.searchPlaceholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <TextField
            select
            size="small"
            label={t("wishlist.sortBy")}
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            sx={{ minWidth: 160 }}
          >
            {SORT_ORDERS.map((order) => (
              <MenuItem key={order} value={order}>
                {t(`wishlist.sort.${order}`)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">{t("common.loading")}</Typography>
      ) : wishlist.length === 0 ? (
        <Alert severity="info">{t("wishlist.empty")}</Alert>
      ) : (
        <>
          {recent.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6">
                {t("wishlist.recentlyAdded")}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                {t("wishlist.recentlyAddedDescription")}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{ flexWrap: "wrap" }}
              >
                {recent.map((manga) => (
                  <Chip
                    key={manga.id}
                    component={Link}
                    to={`/manga/${manga.id}`}
                    state={{ from: "wishlist" }}
                    clickable
                    variant="outlined"
                    label={`${manga.title} · ${formatRelativeDate(
                      manga.addedAt,
                      i18n.language,
                    )}`}
                    sx={{ borderStyle: "dashed" }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {isMobile ? (
            <Box>
              <Tabs
                value={tab}
                onChange={(_event, value) => setTab(value)}
                variant="fullWidth"
                sx={{ mb: 2 }}
              >
                {sections.map((section, index) => (
                  <Tab
                    key={section.id}
                    label={`${section.title} (${section.mangas.length})`}
                    value={index}
                  />
                ))}
              </Tabs>
              {renderSection(sections[tab])}
            </Box>
          ) : (
            sections.map(renderSection)
          )}
        </>
      )}
    </Container>
  );
};

export default WishlistPage;
