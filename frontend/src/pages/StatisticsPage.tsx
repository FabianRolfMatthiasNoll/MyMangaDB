import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Rating,
} from "@mui/material";
import { getStatistics } from "../services/statisticsService";
import { Statistics, StatisticCount } from "../api/models";
import { useTranslation } from "react-i18next";
import { useStatusMeta } from "../hooks/useStatusMeta";
import { useCategoryLabel } from "../hooks/useCategoryLabel";

const StatCard = ({ title, value }: { title: string; value: number }) => (
  <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
    <Typography variant="h4" color="primary">
      {value}
    </Typography>
    <Typography variant="subtitle1" color="text.secondary">
      {title}
    </Typography>
  </Paper>
);

/**
 * How the label of a distribution entry is rendered.
 *
 * The backend sends the raw enum values for the status and category
 * distributions ("not_started"), but real names for the author and genre
 * distributions. The names must not be touched - capitalising them turns
 * "hiromu arakawa" into "Hiromu Arakawa".
 */
type LabelKind = "readingStatus" | "overallStatus" | "category" | "name";

const DistributionList = ({
  title,
  data,
  labelKind,
  isRating = false,
}: {
  title: string;
  data: StatisticCount[];
  labelKind: LabelKind;
  isRating?: boolean;
}) => {
  const { t } = useTranslation();
  const { getStatusLabel } = useStatusMeta();
  const getCategoryLabel = useCategoryLabel();

  const renderLabel = (label: string) => {
    if (labelKind === "readingStatus" || labelKind === "overallStatus") {
      return getStatusLabel(label);
    }
    if (labelKind === "category") {
      return getCategoryLabel(label);
    }
    return label;
  };

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List dense>
        {data.map((item, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={
                isRating ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {item.label === "Unrated" ? (
                      <Typography variant="body2">
                        {t("common.unrated")}
                      </Typography>
                    ) : (
                      <>
                        <Rating
                          value={Number(item.label)}
                          readOnly
                          size="small"
                          precision={0.5}
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({item.label})
                        </Typography>
                      </>
                    )}
                  </Box>
                ) : (
                  renderLabel(item.label)
                )
              }
            />
            <Typography variant="body2">{item.count}</Typography>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

const StatisticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStatistics();
        setStats(data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Container>
        <Typography variant="h5">{t("common.errorLoading")}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        {t("statistics.title")}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            title={t("statistics.totalMangas")}
            value={stats.totalMangas}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            title={t("statistics.totalVolumes")}
            value={stats.totalVolumes}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            title={t("statistics.totalAuthors")}
            value={stats.totalAuthors}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            title={t("statistics.totalGenres")}
            value={stats.totalGenres}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            title={t("statistics.totalLists")}
            value={stats.totalLists}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList
            title={t("statistics.readingStatus")}
            data={stats.readingStatusDistribution}
            labelKind="readingStatus"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList
            title={t("statistics.overallStatus")}
            data={stats.overallStatusDistribution}
            labelKind="overallStatus"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList
            title={t("statistics.category")}
            data={stats.categoryDistribution}
            labelKind="category"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList
            title={t("statistics.rating")}
            data={stats.ratingDistribution}
            labelKind="name"
            isRating
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList
            title={t("statistics.topGenres")}
            data={stats.topGenres}
            labelKind="name"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList
            title={t("statistics.topAuthors")}
            data={stats.topAuthors}
            labelKind="name"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default StatisticsPage;
