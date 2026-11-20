import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  toggleAdvancedFilters: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  sortOrder,
  setSortOrder,
  toggleAdvancedFilters,
}) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        // The row has to wrap. Without it the search field shrinks to a
        // few characters wide on a narrow screen.
        flexWrap: "wrap",
        gap: 2,
        mt: { xs: 2 },
        mb: { xs: 0, md: 5, lg: 5, xl: 5 },
      }}
    >
      <TextField
        label={t("search.searchPlaceholder")}
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ flex: "1 1 200px", minWidth: 0 }}
      />
      <FormControl variant="outlined" sx={{ minWidth: 140 }}>
        <InputLabel>{t("search.sortBy")}</InputLabel>
        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          label={t("search.sortBy")}
        >
          <MenuItem value="asc">{t("search.asc")}</MenuItem>
          <MenuItem value="desc">{t("search.desc")}</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="contained"
        onClick={toggleAdvancedFilters}
        sx={{ maxWidth: 160 }}
      >
        {t("search.advancedFilters")}
      </Button>
    </Box>
  );
};

export default SearchBar;
