import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  Chip,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import { importMalList } from "../../services/importService";
import { ImportResponse } from "../../api/models";

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
  const { t } = useTranslation();
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
        setError(t("errors.failedToImportDatabase"));
      }
    } catch (err) {
      setError(t("errors.failedToImportDatabase"));
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "imported":
        return <CheckCircleIcon color="success" fontSize="small" />;
      case "skipped":
        return <SkipNextIcon color="warning" fontSize="small" />;
      case "failed":
        return <ErrorIcon color="error" fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("importMAL.title")}</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <Typography variant="body2" gutterBottom>
            {t("importMAL.selectFile")}
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
              {t("importMAL.chooseFile")}
            </Button>
          </label>
          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {t("importMAL.selected", { filename: file.name })}
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
            <Alert
              severity={result.failed > 0 ? "warning" : "success"}
              sx={{ mb: 2 }}
            >
              {t("importMAL.resultSummary", {
                total: result.total,
                imported: result.imported,
                skipped: result.skipped,
                failed: result.failed,
              })}
            </Alert>

            {result.logs && result.logs.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  maxHeight: 300,
                  overflow: "auto",
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                }}
              >
                <List dense>
                  {result.logs.map((log, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <Box
                          sx={{ mr: 2, display: "flex", alignItems: "center" }}
                        >
                          {getStatusIcon(log.status)}
                        </Box>
                        <ListItemText
                          primary={log.title}
                          secondary={t(`errors.infoCodes.${log.infoCode}` as const) || log.infoCode}
                          primaryTypographyProps={{
                            fontWeight: "bold",
                            color:
                              log.status === "failed"
                                ? "error"
                                : log.status === "skipped"
                                ? "text.secondary"
                                : "text.primary",
                          }}
                        />
                        <Chip
                          label={log.status}
                          size="small"
                          color={
                            log.status === "imported"
                              ? "success"
                              : log.status === "skipped"
                              ? "warning"
                              : "error"
                          }
                          variant="outlined"
                        />
                      </ListItem>
                      {index < result.logs.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("common.close")}</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!file || loading}
        >
          {t("common.import")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportMALModal;
