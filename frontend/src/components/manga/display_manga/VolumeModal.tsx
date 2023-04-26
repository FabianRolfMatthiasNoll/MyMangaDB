import { Manga, Volume } from "../../../api/models";
import { Grid, Modal, Paper, Typography } from "@mui/material";
import VolumeCard from "./VolumeCard";

interface Props {
  manga: Manga;
  onClose: () => void;
}

export default function VolumesModal({ manga, onClose }: Props) {
  return (
    <Modal open={true} onClose={onClose}>
      <Paper
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 5,
          overflow: "auto",
          maxWidth: "95vw", // or any other value
          maxHeight: "95vh", // or any other value
          width: "90vw",
        }}
      >
        <Typography variant="h2" component="h2" mb={2}>
          Volumes
        </Typography>
        <Grid container spacing={1}>
          {manga.volumes.map((volume: Volume) => (
            <Grid item xs={6} sm={4} md={2} lg={1} key={volume.volumeNum}>
              <VolumeCard volume={volume} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Modal>
  );
}
