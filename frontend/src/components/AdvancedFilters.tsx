import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Slider,
} from "@mui/material";
import { OverallStatus, ReadingStatus, Category } from "../api/models";
import { SelectChangeEvent } from "@mui/material/Select";

interface AdvancedFiltersProps {
  filterCategory: string[];
  setFilterCategory: (category: string[]) => void;
  filterReadingStatus: string[];
  setFilterReadingStatus: (status: string[]) => void;
  filterOverallStatus: string[];
  setFilterOverallStatus: (status: string[]) => void;
  ratingRange: number[];
  setRatingRange: (range: number[]) => void;
  resetFilters: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filterCategory,
  setFilterCategory,
  filterReadingStatus,
  setFilterReadingStatus,
  filterOverallStatus,
  setFilterOverallStatus,
  ratingRange,
  setRatingRange,
  resetFilters,
}) => {
  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    setFilterCategory(event.target.value as string[]);
  };

  const handleReadingStatusChange = (event: SelectChangeEvent<string[]>) => {
    setFilterReadingStatus(event.target.value as string[]);
  };

  const handleOverallStatusChange = (event: SelectChangeEvent<string[]>) => {
    setFilterOverallStatus(event.target.value as string[]);
  };

  const handleRatingRangeChange = (
    _event: Event,
    newValue: number | number[]
  ) => {
    setRatingRange(newValue as number[]);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
      <FormControl variant="outlined" sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          multiple
          value={filterCategory}
          onChange={handleCategoryChange}
          label="Category"
        >
          {Object.values(Category).map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl variant="outlined" sx={{ mb: 2 }}>
        <InputLabel>Reading Status</InputLabel>
        <Select
          multiple
          value={filterReadingStatus}
          onChange={handleReadingStatusChange}
          label="Reading Status"
        >
          {Object.entries(ReadingStatus).map(([key, value]) => (
            <MenuItem key={key} value={value}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl variant="outlined" sx={{ mb: 2 }}>
        <InputLabel>Overall Status</InputLabel>
        <Select
          multiple
          value={filterOverallStatus}
          onChange={handleOverallStatusChange}
          label="Overall Status"
        >
          {Object.entries(OverallStatus).map(([key, value]) => (
            <MenuItem key={key} value={value}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ mb: 2 }}>
        <InputLabel>Rating Range</InputLabel>
        <Slider
          value={ratingRange}
          onChange={handleRatingRangeChange}
          valueLabelDisplay="auto"
          min={0}
          max={5}
        />
      </Box>
      <Button variant="contained" onClick={resetFilters}>
        Reset Filters
      </Button>
    </Box>
  );
};

export default AdvancedFilters;
