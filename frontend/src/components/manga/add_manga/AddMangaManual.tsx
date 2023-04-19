import React from "react";
import { Manga } from "../../../api/models";
import { Grid, TextField } from "@mui/material";

type Props = {
  manga: Manga;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Manga
  ) => void;
};

const AddMangaManual: React.FC<Props> = ({ manga, handleInputChange }) => {
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
    </Grid>
  );
};

export default AddMangaManual;
