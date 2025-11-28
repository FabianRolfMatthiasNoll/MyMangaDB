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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { getSettings, updateSetting, Settings } from "../services/settingsService";
import DatabaseOperations from "../components/DatabaseOperations";
import { UsersApi } from "../api";
import { configuration } from "../services/config";

const usersApi = new UsersApi(configuration);

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [migrateDialogOpen, setMigrateDialogOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{ key: string; value: string } | null>(null);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [tempPath, setTempPath] = useState("");

  // Password Change State
  const [selectedUser, setSelectedUser] = useState("admin");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

  const handlePasswordChange = async () => {
    if (!newPassword) {
      setPasswordMessage({ type: 'error', text: 'Password cannot be empty' });
      return;
    }
    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      await usersApi.changePasswordApiV1UsersChangePasswordPost({
        userUpdatePassword: {
          username: selectedUser,
          password: newPassword
        }
      });
      setPasswordMessage({ type: 'success', text: 'Password updated successfully' });
      setNewPassword("");
    } catch (err) {
      setPasswordMessage({ type: 'error', text: 'Failed to update password. Ensure you are an admin.' });
    } finally {
      setPasswordLoading(false);
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

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            User Management
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Change Password
          </Typography>
          {passwordMessage && (
            <Alert severity={passwordMessage.type} sx={{ mb: 2 }}>
              {passwordMessage.text}
            </Alert>
          )}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="user-select-label">User</InputLabel>
              <Select
                labelId="user-select-label"
                value={selectedUser}
                label="User"
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="guest">Guest</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              onClick={handlePasswordChange}
              disabled={passwordLoading || !newPassword}
              sx={{ height: 56 }}
            >
              {passwordLoading ? <CircularProgress size={24} /> : "Update"}
            </Button>
          </Box>
        </Paper>

        <DatabaseOperations />

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
