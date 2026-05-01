import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ImportMALModal from "./ImportMALModal";

const ImportMALSection: React.FC = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t("settings.importMAL")}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <HelpOutlineIcon color="primary" />
              <Typography>{t("settings.howToExport")}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              {t("importMAL.title")}
            </Typography>
            <ol>
              <li>
                <Typography variant="body2">
                  Go to the{" "}
                  <Link
                    href="https://myanimelist.net/panel.php?go=export"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    MyAnimeList Export Page
                  </Link>
                  .
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("importMAL.selectFile")}
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Click "Export Now". A <code>.gz</code> file (e.g.,{" "}
                  <code>mangalist.gz</code>) or an <code>.xml</code> file will
                  be downloaded.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  {t("importMAL.selected")}
                </Typography>
              </li>
            </ol>
          </AccordionDetails>
        </Accordion>
      </Box>

      {successMessage && (
        <Typography color="success.main" sx={{ mb: 2 }}>
          {successMessage}
        </Typography>
      )}

      <Button
        variant="contained"
        startIcon={<CloudUploadIcon />}
        onClick={() => setModalOpen(true)}
      >
        {t("settings.importMAL")}
      </Button>

      <ImportMALModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onImportSuccess={() =>
          setSuccessMessage(t("errors.databaseImportedSuccess"))
        }
      />
    </Paper>
  );
};

export default ImportMALSection;
