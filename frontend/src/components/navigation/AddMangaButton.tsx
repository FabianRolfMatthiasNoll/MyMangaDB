import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Switch,
  Toolbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { mangaAPI } from "../../api";
import { Manga, Author, Genre } from "../../api/models";
import { useMutation, useQueryClient } from "react-query";
import AddMangaManual from "../manga/add_manga/AddMangaManual";
import AddMangaMAL from "../manga/add_manga/AddMangaMAL";

const defaultManga: Manga = {
  title: "",
  description: "",
  totalVolumes: 0,
  volumes: [],
  authors: [],
  genres: [],
};

const AddMangaButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [manga, setManga] = useState<Manga>(defaultManga);
  const [authors, setAuthors] = useState<Author[]>([{ name: "", role: "" }]);
  const [genres, setGenres] = useState<Genre[]>([{ name: "" }]);
  const [manualMode, setManualMode] = useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const addAuthor = () => {
    setAuthors([...authors, { name: "", role: "" }]);
  };

  const addGenre = () => {
    setGenres([...genres, { name: "" }]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Manga | "author" | "authorRole" | "genre",
    index?: number
  ) => {
    if (field === "author" || field === "authorRole") {
      const updatedAuthors = [...authors];
      updatedAuthors[index!] = {
        ...updatedAuthors[index!],
        [field === "author" ? "name" : "role"]: e.target.value,
      };
      setAuthors(updatedAuthors);
      setManga({ ...manga, authors: updatedAuthors });
    } else if (field === "genre") {
      const updatedGenres = [...genres];
      updatedGenres[index!] = {
        ...updatedGenres[index!],
        name: e.target.value,
      };
      setGenres(updatedGenres);
      setManga({ ...manga, genres: updatedGenres });
    } else {
      setManga({ ...manga, [field]: e.target.value });
    }
  };

  const handleSubmit = async () => {
    mutation.mutate(manga);
    // Reset manga state and close modal
    setManga(defaultManga);
    handleClose();
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (manga: Manga) =>
      mangaAPI.createMangaMangaPost({ manga: manga }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GetAllMangas"] });
    },
  });
  // TODO: Reset input field states after closing
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: (theme) => theme.spacing(2),
        right: (theme) => theme.spacing(2),
      }}
    >
      <Fab color="primary" aria-label="add" onClick={handleClickOpen}>
        <AddIcon />
      </Fab>
      <Dialog open={open} onClose={handleClose}>
        <Toolbar>
          <DialogTitle>Add New Manga</DialogTitle>
          <Switch
            checked={manualMode}
            onChange={() => setManualMode(!manualMode)}
            color="primary"
          />
        </Toolbar>
        <DialogContent>
          {manualMode ? (
            <>
              <AddMangaManual
                manga={manga}
                authors={authors}
                genres={genres}
                handleInputChange={handleInputChange}
              />
            </>
          ) : (
            <AddMangaMAL manga={manga} handleInputChange={handleInputChange} />
          )}
        </DialogContent>
        <DialogActions>
          {manualMode ? (
            <>
              <Button onClick={addAuthor}>Add Author</Button>
              <Button onClick={addGenre}>Add Genre</Button>
            </>
          ) : (
            <></>
          )}
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default AddMangaButton;
