import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  CardMedia,
  useMediaQuery,
  useTheme,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  getSources,
  getSearchResults,
  createManga,
} from "../services/apiService";
import { Source, MangaCreate } from "../api/models";
import { useNavigate } from "react-router-dom";

interface AutomaticSearchModalProps {
  open: boolean;
  onClose: () => void;
}

const AutomaticSearchModal: React.FC<AutomaticSearchModalProps> = ({
  open,
  onClose,
}) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<MangaCreate[]>([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchSources = async () => {
      const sources = await getSources();
      setSources(sources);
    };

    fetchSources();
  }, []);

  const handleSearch = async () => {
    if (selectedSource) {
      const results = await getSearchResults(searchQuery, selectedSource.name);
      setSearchResults(results);
    }
  };

  const handleCreateManga = async (manga: MangaCreate) => {
    const createdManga = await createManga(manga);
    navigate(`/manga/${createdManga.id}`);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Automatic Manga Search</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            gap: 2,
            mt: 2,
          }}
        >
          <TextField
            fullWidth
            label="Search Manga"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Source</InputLabel>
            <Select
              value={selectedSource ? selectedSource.id : ""}
              onChange={(e) => {
                const source = sources.find((s) => s.id === e.target.value);
                setSelectedSource(source || null);
              }}
              fullWidth
              label="Source"
            >
              {sources.map((source) => (
                <MenuItem key={source.id} value={source.id}>
                  {`${source.name} (${source.language})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ height: isMobile ? "auto" : "56px" }}
          >
            Search
          </Button>
        </Box>
        {searchResults.length > 0 && (
          <Box mt={2}>
            <Typography variant="h6">Search Results</Typography>
            <Box>
              {searchResults.map((manga) => (
                <Card
                  key={manga.title}
                  sx={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    mb: 2,
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      width: isMobile ? "100%" : 151,
                      height: isMobile ? 200 : "auto",
                    }}
                    image={
                      manga.coverImage ||
                      "/static/images/cards/contemplative-reptile.jpg"
                    }
                    alt={manga.title}
                  />
                  <CardContent sx={{ flex: "1 1 auto" }}>
                    <Typography
                      component="div"
                      variant="h6"
                      sx={{ whiteSpace: "normal", wordBreak: "break-word" }}
                    >
                      {manga.title}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      component="div"
                      sx={{ whiteSpace: "normal", wordBreak: "break-word" }}
                    >
                      {manga.authors.map((author) => author.name).join(", ")}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: isMobile ? "none" : "3",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {manga.summary}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => handleCreateManga(manga)}
                      sx={{ mt: 1 }}
                    >
                      Add to Database
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutomaticSearchModal;
