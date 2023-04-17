import { useState } from "react";
import { useQuery } from "react-query";
import Grid from "@mui/material/Grid";
import * as React from "react";
import { manga } from "./api";
import { Manga } from "./api/models";
import MangaCard from "./MangaCard";

const MangaList: React.FC = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);

  // TODO: Check for : in title an remove when searching for cover image

  const stationQuery = useQuery({
    queryKey: "GetAllMangas",
    queryFn: () => manga.getAllMangasMangaGet(),
    onSuccess: (data) => setMangas(data),
  });

  if (stationQuery.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Grid container spacing={1}>
      {mangas.map((manga, index) => (
        <Grid xs={6} md={3} lg={2.4}>
          <MangaCard manga={manga} key={index} />
        </Grid>
      ))}
    </Grid>
  );
};

export default MangaList;
