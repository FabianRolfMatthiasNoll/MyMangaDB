import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { getSettings, updateSetting, Settings } from "../services/settingsService";

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [migrateDialogOpen, setMigrateDialogOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{ key: string; value: string } | null>(null);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [tempPath, setTempPath] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (key: string) => {
    setEditingPath(key);
    setTempPath(settings?.[key as keyof Settings] || "");
  };

  const handleCancelEdit = () => {
    setEditingPath(null);
    setTempPath("");
  };

  const handleAcceptEdit = () => {
    if (editingPath) {
      setPendingChange({ key: editingPath, value: tempPath });
      setMigrateDialogOpen(true);
      setEditingPath(null);
    }
  };

  const handleMigrateConfirm = async () => {
    if (!pendingChange) return;

    try {
      setLoading(true);
      await updateSetting(pendingChange.key, pendingChange.value, true);
      await fetchSettings();
      setSuccess("Settings updated and data migrated successfully");
    } catch (err) {
      setError("Failed to update settings and migrate data");
    } finally {
      setLoading(false);
      setMigrateDialogOpen(false);
      setPendingChange(null);
    }
  };

  const handleMigrateCancel = () => {
    setMigrateDialogOpen(false);
    setPendingChange(null);
  };

  if (loading && !settings) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Data Paths
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                label="Database Path"
                value={editingPath === 'database_path' ? tempPath : settings?.database_path || ""}
                onChange={(e) => setTempPath(e.target.value)}
                disabled={editingPath !== 'database_path'}
                margin="normal"
                helperText="Path to store the SQLite database file"
              />
              {editingPath === 'database_path' ? (
                <>
                  <IconButton onClick={handleAcceptEdit} color="primary">
                    <CheckIcon />
                  </IconButton>
                  <IconButton onClick={handleCancelEdit} color="error">
                    <CloseIcon />
                  </IconButton>
                </>
              ) : (
                <IconButton onClick={() => handleEditClick('database_path')}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                label="Images Path"
                value={editingPath === 'image_path' ? tempPath : settings?.image_path || ""}
                onChange={(e) => setTempPath(e.target.value)}
                disabled={editingPath !== 'image_path'}
                margin="normal"
                helperText="Path to store the images directory"
              />
              {editingPath === 'image_path' ? (
                <>
                  <IconButton onClick={handleAcceptEdit} color="primary">
                    <CheckIcon />
                  </IconButton>
                  <IconButton onClick={handleCancelEdit} color="error">
                    <CloseIcon />
                  </IconButton>
                </>
              ) : (
                <IconButton onClick={() => handleEditClick('image_path')}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Paper>

        <Dialog open={migrateDialogOpen} onClose={handleMigrateCancel}>
          <DialogTitle>Migrate Data</DialogTitle>
          <DialogContent>
            <Typography>
              Would you like to migrate the existing data to the new location?
              This will copy all files to the new path.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleMigrateCancel}>Cancel</Button>
            <Button onClick={handleMigrateConfirm} variant="contained" color="primary">
              Migrate Data
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default SettingsPage; 