import { useState } from "react";
import { useQuery } from "react-query";
import Grid from "@mui/material/Grid";
import * as React from "react";
import { mangaAPI } from "../../api";
import { Manga } from "../../api/models";
import MangaCard from "../manga/display_manga/MangaCard";

const MangaList: React.FC = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);

  const stationQuery = useQuery({
    queryKey: "GetAllMangas",
    queryFn: () => mangaAPI.getAllMangasMangaGet(),
    onSuccess: (data) => setMangas(data),
  });

  if (stationQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (stationQuery.isError) {
    console.error(stationQuery.error);
  }

  return (
    <Grid container spacing={2}>
      {mangas.map((manga, index) => (
        <Grid item key={index} xs={6} md={3} lg={2.4} xl={2}>
          <MangaCard manga={manga} />
        </Grid>
      ))}
    </Grid>
  );
};

export default MangaList;
