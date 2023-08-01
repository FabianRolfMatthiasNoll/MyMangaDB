import { Box, Button, Grid, Modal, Paper, TextField } from "@mui/material";
import React, { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Volume } from "../../../api/models";
import { mangaAPI } from "../../../api";

interface Props {
  mangaId: number;
  onClose: () => void;
}

const defaultVolume: Volume = {
  id: 0,
  volumeNum: 0,
  mangaId: 0,
  coverImage: "",
};

export default function AddVolume({ mangaId, onClose }: Props) {
  const [newVolume, setNewVolume] = useState<Volume>({
    ...defaultVolume,
    mangaId: mangaId,
  });

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          const base64String = (reader.result as string).replace(
            /^data:image\/[a-z]+;base64,/,
            ""
          );
          setNewVolume((prev) => ({ ...prev, coverImage: base64String }));
        };
      }
    },
    []
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setNewVolume((prev) => ({ ...prev, [name]: Number(value) }));
    },
    []
  );

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (volume: Volume) =>
      mangaAPI.addVolumeMangaVolumePost({ volume }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GetAllMangas"] });
    },
  });

  const handleSubmit = useCallback(async () => {
    mutation.mutate(newVolume);
    onClose();
  }, [newVolume, mutation, onClose]);

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
          maxWidth: "95vw",
          maxHeight: "95vh",
          width: "90vw",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            mb: 5,
          }}
        >
          <Grid container spacing={2}>
            {/* Left Column - Cover Image Uploader */}
            <Grid item sm="auto">
              <Box
                sx={{
                  width: 150,
                  height: 200,
                  border: "2px dashed gray",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                />
              </Box>
            </Grid>

            {/* Right Column - Volume Number */}
            <Grid item sm={true}>
              <Box mb={2}>
                <TextField
                  required
                  label="Volume Number"
                  type="number"
                  fullWidth
                  name="volumeNum"
                  value={newVolume.volumeNum}
                  onChange={handleInputChange}
                />
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              width: "100%",
              mt: 3,
            }}
          >
            <Button onClick={handleSubmit}>Add Volume</Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
}
