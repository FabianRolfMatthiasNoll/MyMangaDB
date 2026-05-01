import React from "react";
import { Container, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <Typography variant="h4">{t("notFound.title")}</Typography>
    </Container>
  );
};

export default NotFound;
