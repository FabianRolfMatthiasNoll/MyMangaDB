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

const StatisticsPage: React.FC = () => {
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
        <Typography variant="h5">Failed to load statistics</Typography>
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
                      <Typography variant="body2">Unrated</Typography>
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
        Statistics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard title="Total Mangas" value={stats.totalMangas} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard title="Total Volumes" value={stats.totalVolumes} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard title="Total Authors" value={stats.totalAuthors} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard title="Total Genres" value={stats.totalGenres} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard title="Total Lists" value={stats.totalLists} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList
            title="Reading Status"
            data={stats.readingStatusDistribution}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList
            title="Overall Status"
            data={stats.overallStatusDistribution}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList
            title="Category"
            data={stats.categoryDistribution}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList
            title="Rating"
            data={stats.ratingDistribution}
            isRating
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList title="Top Genres" data={stats.topGenres} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DistributionList title="Top Authors" data={stats.topAuthors} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default StatisticsPage;
