import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Slider,
  Autocomplete,
  TextField,
} from "@mui/material";
import {
  OverallStatus,
  ReadingStatus,
  Category,
  ListModel,
} from "../api/models";
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
  availableLists: ListModel[];
  filterList: ListModel | null;
  setFilterList: (list: ListModel | null) => void;
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
  availableLists,
  filterList,
  setFilterList,
  resetFilters,
}) => {
  const { t } = useTranslation();
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
        <InputLabel>{t("filters.category")}</InputLabel>
        <Select
          multiple
          value={filterCategory}
          onChange={handleCategoryChange}
          label={t("filters.category")}
        >
          {Object.values(Category).map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl variant="outlined" sx={{ mb: 2 }}>
        <InputLabel>{t("filters.readingStatus")}</InputLabel>
        <Select
          multiple
          value={filterReadingStatus}
          onChange={handleReadingStatusChange}
          label={t("filters.readingStatus")}
        >
          {Object.entries(ReadingStatus).map(([key, value]) => (
            <MenuItem key={key} value={value}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl variant="outlined" sx={{ mb: 2 }}>
        <InputLabel>{t("filters.overallStatus")}</InputLabel>
        <Select
          multiple
          value={filterOverallStatus}
          onChange={handleOverallStatusChange}
          label={t("filters.overallStatus")}
        >
          {Object.entries(OverallStatus).map(([key, value]) => (
            <MenuItem key={key} value={value}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl variant="outlined" sx={{ mb: 2 }}>
        <Autocomplete
          options={availableLists}
          getOptionLabel={(option) => option.name}
          value={filterList}
          onChange={(_event, newValue) => setFilterList(newValue)}
          renderInput={(params) => (
            <TextField {...params} label={t("filters.filterByList")} variant="outlined" />
          )}
        />
      </FormControl>
      <Box sx={{ mb: 2 }}>
        <InputLabel>{t("filters.ratingRange")}</InputLabel>
        <Slider
          value={ratingRange}
          onChange={handleRatingRangeChange}
          valueLabelDisplay="auto"
          min={0}
          max={5}
        />
      </Box>
      <Button variant="contained" onClick={resetFilters}>
        {t("filters.resetFilters")}
      </Button>
    </Box>
  );
};

export default AdvancedFilters;
