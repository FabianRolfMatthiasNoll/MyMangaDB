import React from "react";
import { Manga, Author, Genre } from "../../../api/models";
import { Grid, IconButton, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
  manga: Manga;
  authors: Author[];
  genres: Genre[];
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Manga | "author" | "authorRole" | "genre",
    index?: number
  ) => void;
  removeAuthor: (index: number) => void;
  removeGenre: (index: number) => void;
};

const AddMangaManual: React.FC<Props> = ({
  manga,
  authors,
  genres,
  handleInputChange,
  removeAuthor,
  removeGenre,
}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          required
          label="Title"
          fullWidth
          value={manga.title}
          onChange={(e) => handleInputChange(e, "title")}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Description"
          fullWidth
          value={manga.description}
          onChange={(e) => handleInputChange(e, "description")}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Total Volumes"
          type="number"
          fullWidth
          value={manga.totalVolumes}
          onChange={(e) => handleInputChange(e, "totalVolumes")}
        />
      </Grid>
      {authors.map((author, index) => (
        <React.Fragment key={index}>
          <Grid item xs={12} sm={6}>
            <TextField
              label={`Author ${index + 1}`}
              fullWidth
              value={author.name}
              onChange={(e) => handleInputChange(e, "author", index)}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label={`Role ${index + 1}`}
              fullWidth
              value={author.role}
              onChange={(e) => handleInputChange(e, "authorRole", index)}
            />
          </Grid>
          <Grid item xs={12} sm={1} container alignItems="center">
            <IconButton aria-label="delete" onClick={() => removeAuthor(index)}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        </React.Fragment>
      ))}
      {genres.map((genre, index) => (
        <React.Fragment key={index}>
          <Grid item xs={12} sm={11}>
            <TextField
              label={`Genre ${index + 1}`}
              fullWidth
              value={genre.name}
              onChange={(e) => handleInputChange(e, "genre", index)}
            />
          </Grid>
          <Grid item xs={12} sm={1} container alignItems="center">
            <IconButton aria-label="delete" onClick={() => removeGenre(index)}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  );
};

export default AddMangaManual;
