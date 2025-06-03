import React, { useEffect, useState } from "react";
import {
  List,
  ListItemText,
  Container,
  Typography,
  CircularProgress,
  Box,
  ListItemButton,
} from "@mui/material";
import { Link } from "react-router-dom";
import { getListsWithCounts } from "../services/apiService";
import { ListModel } from "../api/models";

const ListOverview: React.FC = () => {
  const [lists, setLists] = useState<(ListModel & { mangaCount: number })[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const lists = await getListsWithCounts();
        setLists(lists);
      } catch (error) {
        console.error("Failed to fetch lists", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manga Lists
      </Typography>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {lists.map((list) => (
            <ListItemButton
              key={list.id}
              component={Link}
              to={`/list/${list.id}`}
            >
              <ListItemText
                primary={list.name}
                secondary={`Mangas: ${list.mangaCount}`}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Container>
  );
};

export default ListOverview;
