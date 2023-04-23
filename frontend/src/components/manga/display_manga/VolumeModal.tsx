import { useState } from "react";
import { Manga } from "../../../api/models";
import { Box, Button, Grid, Modal, TextField, Typography } from "@mui/material";

interface Props {
  manga: Manga;
  onClose: () => void;
}
// TODO: When volume name as string is implemented dont generate volume name instead take it from database
export default function VolumesModal({ manga, onClose }: Props) {
  const [volumes, setVolumes] = useState(
    new Array(manga.totalVolumes).fill({
      visible: true,
      owned: false,
    })
  );
  const [editMode, setEditMode] = useState(false);

  const handleVolumeClick = (index: number) => {
    if (editMode) {
      setVolumes((prevVolumes) =>
        prevVolumes.map((value, i) =>
          i === index ? { ...value, owned: !value.owned } : value
        )
      );
    }
  };

  const handleSave = () => {
    // TODO: Save volumes to database
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 5,
          maxWidth: "80vw",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <Typography variant="h2" component="h2" mb={2}>
          Volumes
        </Typography>
        <Grid container spacing={1}>
          {volumes.map(({ visible, owned }, index) => (
            <Grid key={index} item xs={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: owned
                    ? "success.main"
                    : visible
                    ? editMode
                      ? "grey.300"
                      : "grey.500"
                    : "grey.100",
                  color: "white",
                }}
                onClick={() => handleVolumeClick(index)}
              >
                {`Volume ${index + 1}`}
              </Button>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => setEditMode((prevEditMode) => !prevEditMode)}
          >
            {editMode ? "Done" : "Edit"}
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
