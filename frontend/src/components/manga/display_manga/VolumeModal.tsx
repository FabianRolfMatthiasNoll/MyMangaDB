import { Manga, Volume } from "../../../api/models";
import {
  Button,
  Grid,
  Modal,
  Paper,
  Typography,
  Card,
  Box,
} from "@mui/material";
import VolumeCard from "./VolumeCard";
import AddVolume from "../adding_components/AddVolume";
import React from "react";

interface Props {
  manga: Manga;
  onClose: () => void;
}

// ListView Component
function ListView({ volumes }: { volumes: Volume[] }) {
  return (
    <Box
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      gap="8px" // This controls the space between items. Adjust as needed.
    >
      {volumes.map((volume: Volume) => (
        <Box key={volume.volumeNum}>
          <Card
            elevation={3}
            sx={{
              width: "60px",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Typography variant="h6" component="div">
              {volume.volumeNum}
            </Typography>
          </Card>
        </Box>
      ))}
    </Box>
  );
}

// CardView Component
function CardView({ volumes }: { volumes: Volume[] }) {
  return (
    <Grid container spacing={2}>
      {volumes.map((volume: Volume) => (
        <Grid item xs={6} sm={4} md={2} lg={1} key={volume.volumeNum}>
          <VolumeCard volume={volume} />
        </Grid>
      ))}
    </Grid>
  );
}

export default function VolumesModal({ manga, onClose }: Props) {
  const [isAddVolumeOpen, setIsAddVolumeOpen] = React.useState(false);
  const [isListView, setIsListView] = React.useState(false);

  const handleAddVolumeClose = () => {
    setIsAddVolumeOpen(false);
  };

  return (
    <Modal open={true} onClose={onClose}>
      <>
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
            maxWidth: "95vw",
            maxHeight: "95vh",
            width: "90vw",
          }}
        >
          <Typography variant="h2" component="h2" mb={2}>
            Volumes
          </Typography>
          <Button onClick={() => setIsListView(!isListView)}>
            {isListView ? "Show Detailed View" : "Show List View"}
          </Button>
          <>
            {isListView ? (
              <ListView volumes={manga.volumes} />
            ) : (
              <CardView volumes={manga.volumes} />
            )}
          </>
          {/* Button to trigger the AddVolume component */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsAddVolumeOpen(true)}
            style={{ marginTop: "20px" }}
          >
            Add New Volume
          </Button>
        </Paper>
        {/* AddVolume modal */}
        {isAddVolumeOpen && (
          <AddVolume mangaId={manga.id} onClose={handleAddVolumeClose} />
        )}
      </>
    </Modal>
  );
}
