import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { UsersApi } from "../../api";
import { configuration } from "../../services/config";

const usersApi = new UsersApi(configuration);

const UserManagementSection: React.FC = () => {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState("admin");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handlePasswordChange = async () => {
    if (!newPassword) {
      setPasswordMessage({ type: "error", text: t("errors.passwordCannotBeEmpty") });
      return;
    }
    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      await usersApi.changePasswordApiV1UsersChangePasswordPost({
        userUpdatePassword: {
          username: selectedUser,
          password: newPassword,
        },
      });
      setPasswordMessage({
        type: "success",
        text: t("errors.passwordUpdateSuccess"),
      });
      setNewPassword("");
    } catch (err) {
      setPasswordMessage({
        type: "error",
        text: t("errors.passwordUpdateFailed"),
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t("settings.userManagement")}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {t("settings.changePassword")}
      </Typography>
      {passwordMessage && (
        <Alert severity={passwordMessage.type} sx={{ mb: 2 }}>
          {passwordMessage.text}
        </Alert>
      )}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="user-select-label">{t("settings.user")}</InputLabel>
          <Select
            labelId="user-select-label"
            value={selectedUser}
            label={t("settings.user")}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="guest">Guest</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label={t("settings.newPassword")}
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
          {passwordLoading ? <CircularProgress size={24} /> : t("settings.update")}
        </Button>
      </Box>
    </Paper>
  );
};

export default UserManagementSection;
