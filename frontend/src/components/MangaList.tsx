import React from "react";
import {
  List,
  Grid,
} from "@mui/material";
import { Manga } from "../api/models";
import MangaCard from "./MangaCard";
import MobileMangaListItem from "./MobileMangaListItem";

interface MangaListProps {
  mangas: Manga[];
  isMobile: boolean;
  listId?: number;
}

const MangaList: React.FC<MangaListProps> = ({ mangas, isMobile, listId }) => {
  return (
    <>
      {isMobile ? (
        <List sx={{ p: 0 }}>
          {mangas.map((manga) => (
            <MobileMangaListItem key={manga.id} manga={manga} listId={listId} />
          ))}
        </List>
      ) : (
        <Grid container spacing={2}>
          {mangas.map((manga) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={manga.id}>
              <MangaCard 
                manga={manga} 
                listId={listId}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default MangaList;
