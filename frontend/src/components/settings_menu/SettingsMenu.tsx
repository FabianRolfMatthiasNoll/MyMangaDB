import React, { useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Grid,
} from "@mui/material";
import PlagiarismIcon from "@mui/icons-material/Plagiarism";
import { useMutation } from "react-query";
import { excelIOAPI } from "../../api";

const SettingsMenu: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const mutationImport = useMutation(
    (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return excelIOAPI.importMangasFromExcelExcelImportPost({ file });
    },
    {
      onSuccess: (data) => {
        setMessage(data.message);
        setFile(null);
      },
      onError: (error: any) => {
        setMessage("Error during import");
        setFile(null);
      },
    }
  );

  const mutationExport = useMutation(
    () => excelIOAPI.exportMangasToExcelExcelExportGet(),
    {
      onSuccess: (data) => {
        setMessage(data.message);
      },
      onError: (error: any) => {
        setMessage("Error during export");
      },
    }
  );

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleImport = () => {
    if (file) {
      mutationImport.mutate(file);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("http://localhost:8000/excel/export", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "MyMangaDB_library.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
        setMessage("Export successful!");
      } else {
        throw new Error("Failed to export");
      }
    } catch (error) {
      setMessage("Error during export");
    }
  };

  const handleClose = () => {
    setMessage(null);
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item>
        <Button variant="outlined" onClick={openFilePicker}>
          Choose Excel File
        </Button>
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </Grid>

      {file && (
        <Grid item>
          <Grid container alignItems="center" spacing={1}>
            <Grid item>
              <PlagiarismIcon />
            </Grid>
            <Grid item>{file.name}</Grid>
          </Grid>
        </Grid>
      )}

      <Grid item>
        <Button
          variant="contained"
          color="primary"
          onClick={handleImport}
          disabled={mutationImport.isLoading || !file}
        >
          Import from Excel
        </Button>
      </Grid>

      <Grid item>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleExport}
          disabled={mutationExport.isLoading}
        >
          Export to Excel
        </Button>
      </Grid>

      <Grid item>
        {(mutationImport.isLoading || mutationExport.isLoading) && (
          <CircularProgress />
        )}
      </Grid>

      <Dialog open={!!message} onClose={handleClose}>
        <DialogTitle>Notification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {message || "Unknown error occurred"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default SettingsMenu;
