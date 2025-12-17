import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { updateSetting, Settings } from "../../services/settingsService";

interface DataPathsSectionProps {
  settings: Settings | null;
  onSettingsUpdated: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

const DataPathsSection: React.FC<DataPathsSectionProps> = ({
  settings,
  onSettingsUpdated,
  onError,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [migrateDialogOpen, setMigrateDialogOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    key: string;
    value: string;
  } | null>(null);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [tempPath, setTempPath] = useState("");

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
      onSuccess("Settings updated and data migrated successfully");
      onSettingsUpdated();
    } catch (err) {
      onError("Failed to update settings and migrate data");
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

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Data Paths
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            fullWidth
            label="Database Path"
            value={
              editingPath === "database_path"
                ? tempPath
                : settings?.database_path || ""
            }
            onChange={(e) => setTempPath(e.target.value)}
            disabled={editingPath !== "database_path" || loading}
            margin="normal"
            helperText="Path to store the SQLite database file"
          />
          {editingPath === "database_path" ? (
            <>
              <IconButton
                onClick={handleAcceptEdit}
                color="primary"
                disabled={loading}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                onClick={handleCancelEdit}
                color="error"
                disabled={loading}
              >
                <CloseIcon />
              </IconButton>
            </>
          ) : (
            <IconButton
              onClick={() => handleEditClick("database_path")}
              disabled={loading}
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            fullWidth
            label="Images Path"
            value={
              editingPath === "image_path"
                ? tempPath
                : settings?.image_path || ""
            }
            onChange={(e) => setTempPath(e.target.value)}
            disabled={editingPath !== "image_path" || loading}
            margin="normal"
            helperText="Path to store the images directory"
          />
          {editingPath === "image_path" ? (
            <>
              <IconButton
                onClick={handleAcceptEdit}
                color="primary"
                disabled={loading}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                onClick={handleCancelEdit}
                color="error"
                disabled={loading}
              >
                <CloseIcon />
              </IconButton>
            </>
          ) : (
            <IconButton
              onClick={() => handleEditClick("image_path")}
              disabled={loading}
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Dialog open={migrateDialogOpen} onClose={handleMigrateCancel}>
        <DialogTitle>Migrate Data</DialogTitle>
        <DialogContent>
          <Typography>
            Would you like to migrate the existing data to the new location?
            This will copy all files to the new path.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMigrateCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleMigrateConfirm}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Migrate Data
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DataPathsSection;
