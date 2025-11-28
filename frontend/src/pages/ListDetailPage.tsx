import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getListById, updateList, deleteList } from "../services/listService";
import { Manga, ListModel } from "../api/models";
import { getMangasByListId } from "../services/mangaService";
import MangaList from "../components/MangaList";

const ListDetailPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [list, setList] = useState<ListModel | null>(null);
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListData = async () => {
      try {
        setLoading(true);
        if (listId) {
          const listResponse = await getListById(Number(listId));
          setList(listResponse);
          const mangasResponse = await getMangasByListId(Number(listId));
          setMangas(mangasResponse);
        }
      } catch (error) {
        console.error("Error fetching list data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListData();
  }, [listId]);

  const handleBack = () => {
    navigate("/lists");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!list) {
    return (
      <Container maxWidth="lg">
        <Box p={3}>
          <Typography variant="h5">List not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box p={isMobile ? 2 : 3}>
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 2 : 3,
            mb: 4,
            backgroundColor: 'transparent',
            borderRadius: 2
          }}
        >
          <Box display="flex" alignItems="center" mb={3}>
            <IconButton
              onClick={handleBack}
              sx={{
                mr: 2,
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {list.name}
            </Typography>
          </Box>

          {mangas.length === 0 ? (
            <Box
              textAlign="center"
              py={8}
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No mangas in this list yet
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Add mangas to this list from the manga details page
              </Typography>
            </Box>
          ) : (
            <MangaList mangas={mangas} isMobile={isMobile} listId={Number(listId)} />
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ListDetailPage;
