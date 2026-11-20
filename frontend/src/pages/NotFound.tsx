import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        {t("notFound.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t("notFound.message")}
      </Typography>
      <Box>
        <Button variant="contained" onClick={() => navigate("/")}>
          {t("common.backToDashboard")}
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
