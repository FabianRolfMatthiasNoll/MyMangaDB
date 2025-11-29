import React from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
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
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mt: { xs: 2 },
        mb: { xs: 0, md: 5, lg: 5, xl: 5 },
      }}
    >
      <TextField
        label="Search"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        sx={{ mr: 2 }}
      />
      <FormControl variant="outlined" sx={{ minWidth: 100, mr: 2 }}>
        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <MenuItem value="asc">Asc</MenuItem>
          <MenuItem value="desc">Desc</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="contained"
        onClick={toggleAdvancedFilters}
        sx={{ maxWidth: 110 }}
      >
        Advanced Filters
      </Button>
    </Box>
  );
};

export default SearchBar;
