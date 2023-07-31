import React, { useState } from "react";
import { Author, Manga } from "../../../api/models";
import { Autocomplete, Box, Grid, IconButton, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery } from "react-query";
import { mangaAPI } from "../../../api";

interface Props {
  author: Author;
  index: number;
  handleAuthorChange: (
    index: number,
    field: "name" | "role",
    value: string
  ) => void;
  removeAuthor: (index: number) => void;
}

export default function AuthorInput({
  author,
  index,
  handleAuthorChange,
  removeAuthor,
}: Props) {
  const [existingAuthors, setExistingAuthors] = useState<string[]>([]);
  const [existingRoles, setExistingRoles] = useState<string[]>([]);

  const authorQuery = useQuery({
    queryKey: "GetAllAuthorNames",
    queryFn: () => mangaAPI.getAllAuthorNamesMangaAuthorsGet(),
    onSuccess: (data) => setExistingAuthors(data),
  });

  const roleQuery = useQuery({
    queryKey: "GetAllRoles",
    queryFn: () => mangaAPI.getAllRoleNamesMangaAuthorsRolesGet(),
    onSuccess: (data) => setExistingRoles(data),
  });

  return (
    <Grid container key={index} spacing={2} sm={true}>
      <Grid item xs={6} sm={5}>
        <Box mb={2}>
          <Autocomplete
            id="author-name"
            freeSolo
            options={existingAuthors}
            value={author.name}
            renderInput={(params) => (
              <TextField {...params} label={`Author ${index + 1}`} />
            )}
            onInputChange={(event, newValue) =>
              handleAuthorChange(index, "name", newValue || "")
            }
          />
        </Box>
      </Grid>
      <Grid item xs={5} sm={4}>
        <Box mb={2}>
          <Autocomplete
            key={`author-role-${index}`}
            id={`author-role-${index}`}
            freeSolo
            options={existingRoles}
            value={author.role}
            onInputChange={(event, newValue) =>
              handleAuthorChange(index, "role", newValue || "")
            }
            renderInput={(params) => (
              <TextField
                {...params}
                key={`author-role-${index}`}
                label={`Role ${index + 1}`}
              />
            )}
          />
        </Box>
      </Grid>
      <Grid item xs={1} sm={1} container alignItems="center">
        <IconButton aria-label="delete" onClick={() => removeAuthor(index)}>
          <DeleteIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}
