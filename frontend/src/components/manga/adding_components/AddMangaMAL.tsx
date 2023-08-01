import { useState } from "react";
import { Manga } from "../../../api/models";
import { Button, Grid, TextField, Box } from "@mui/material";
import { useQuery } from "react-query";
import { mangaMALAPI } from "../../../api";
import MangaModalMAL from "./MangaModalMAL";

interface Props {
  onClose: () => void;
}

export default function AddMangaMAL({ onClose }: Props) {
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [open, setOpen] = useState(false);

  const handleSearchClick = async () => {
    resultQuery.refetch();
    setOpen(true);
  };

  const handleClose = () => {
    setMangaList([]);
    setOpen(false);
  };

  const resultQuery = useQuery({
    queryKey: "GetMALSearchResults",
    queryFn: () =>
      mangaMALAPI.getMangaResultsWithMalMalSearchMangaTitleGet({
        mangaTitle: searchTitle,
      }),
    onSuccess: (data) => setMangaList(data),
    enabled: false,
  });

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 5,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              required
              label="Title"
              fullWidth
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
          </Grid>
          {mangaList.map((manga, index) => (
            <MangaModalMAL
              mangaList={mangaList}
              currentIndex={0}
              open={open}
              onClose={handleClose}
            />
          ))}
        </Grid>
      </Box>
      <Button onClick={handleSearchClick}>Search</Button>
    </>
  );
}
