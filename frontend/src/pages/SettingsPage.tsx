import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Alert,
  CircularProgress,
} from "@mui/material";
import { getSettings, Settings } from "../services/settingsService";
import DatabaseOperations from "../components/settings/DatabaseOperations";
import ImportMALSection from "../components/settings/ImportMALSection";
import DataPathsSection from "../components/settings/DataPathsSection";
import UserManagementSection from "../components/settings/UserManagementSection";
import { useTranslation } from "react-i18next";

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  if (loading && !settings) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          {t("settings.title")}
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

        <DataPathsSection
          settings={settings}
          onSettingsUpdated={fetchSettings}
          onError={setError}
          onSuccess={setSuccess}
        />

        <UserManagementSection />

        <DatabaseOperations />

        <ImportMALSection />
      </Box>
    </Container>
  );
};

export default SettingsPage;
