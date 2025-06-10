import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import { databaseService } from '../services/databaseService';

const DatabaseOperations: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('Starting export process');
      const blob = await databaseService.exportDatabase();
      console.log('Received blob from service');
      
      if (!blob || blob.size === 0) {
        throw new Error('Received empty response from server');
      }

      console.log(`Blob size: ${blob.size} bytes`);
      console.log(`Blob type: ${blob.type}`);

      // Create a download link with a more descriptive name
      const url = window.URL.createObjectURL(blob);
      console.log('Created object URL');
      
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `mangadb_export_${date}.zip`;
      document.body.appendChild(a);
      console.log('Starting download');
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Database exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Failed to export database');
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    setImportDialogOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await databaseService.importDatabase(selectedFile);
      setSuccess('Database imported successfully');
      setImportDialogOpen(false);
      setSelectedFile(null);
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import database');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setImportDialogOpen(false);
    setSelectedFile(null);
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Database Operations
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

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<BackupIcon />}
          onClick={handleExport}
          disabled={loading}
        >
          Export Database
        </Button>
        <Button
          variant="contained"
          startIcon={<RestoreIcon />}
          onClick={handleImportClick}
          disabled={loading}
        >
          Import Database
        </Button>
      </Box>

      <Dialog open={importDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Import Database</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Select a database backup file to import. This will replace your current database and images.
          </Typography>
          <input
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="import-file-input"
          />
          <label htmlFor="import-file-input">
            <Button
              variant="outlined"
              component="span"
              fullWidth
            >
              Select File
            </Button>
          </label>
          {selectedFile && (
            <Typography sx={{ mt: 2 }}>
              Selected file: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleImport}
            variant="contained"
            color="primary"
            disabled={!selectedFile || loading}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
};

export default DatabaseOperations; 