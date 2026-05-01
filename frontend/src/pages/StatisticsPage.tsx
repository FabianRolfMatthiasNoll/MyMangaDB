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
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
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

  const formatLabel = (label: string) => {
    // Replace underscores with spaces and capitalize each word
    return label
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

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

  const DistributionList = ({
    title,
    data,
    isRating = false,
  }: {
    title: string;
    data: StatisticCount[];
    isRating?: boolean;
  }) => (
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
                  <Box display="flex" alignItems="center">
                    {item.label === "Unrated" ? (
                      <Typography variant="body2">{t("common.unrated")}</Typography>
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
                  formatLabel(item.label)
                )
              }
            />
            <Typography variant="body2">{item.count}</Typography>
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        {t("settings.title")}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard title={t("manga.title")} value={stats.totalMangas} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard title={t("common.volumes")} value={stats.totalVolumes} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard title={t("common.authors")} value={stats.totalAuthors} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard title={t("common.genres")} value={stats.totalGenres} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard title={t("common.lists")} value={stats.totalLists} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList
            title={t("manga.readingStatus")}
            data={stats.readingStatusDistribution}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList
            title={t("manga.overallStatus")}
            data={stats.overallStatusDistribution}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList
            title={t("manga.category")}
            data={stats.categoryDistribution}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList
            title={t("common.starRating")}
            data={stats.ratingDistribution}
            isRating
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList title={t("common.genres")} data={stats.topGenres} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList title={t("common.authors")} data={stats.topAuthors} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default StatisticsPage;
