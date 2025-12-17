import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { importMalList } from "../services/importService";
import { ImportResponse } from "../api/models";

interface ImportMALModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

const ImportMALModal: React.FC<ImportMALModalProps> = ({
  open,
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await importMalList(file);
      if (response) {
        setResult(response);
        if (onImportSuccess) {
          onImportSuccess();
        }
      } else {
        setError("Import failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during import.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import MyAnimeList</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <Typography variant="body2" gutterBottom>
            Select your MyAnimeList export file (.xml or .gz).
          </Typography>
          <input
            accept=".xml,.gz"
            style={{ display: "none" }}
            id="raised-button-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="raised-button-file">
            <Button variant="outlined" component="span">
              Choose File
            </Button>
          </label>
          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {file.name}
            </Typography>
          )}
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Box sx={{ mt: 2 }}>
            <Alert severity={result.failed > 0 ? "warning" : "success"}>
              Imported: {result.imported} / {result.total}
              {result.failed > 0 && ` (${result.failed} failed)`}
            </Alert>
            {result.errors && result.errors.length > 0 && (
              <Box sx={{ mt: 2, maxHeight: 200, overflow: "auto" }}>
                <Typography variant="subtitle2">Errors:</Typography>
                <List dense>
                  {result.errors.map((err, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={err} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!file || loading}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportMALModal;
