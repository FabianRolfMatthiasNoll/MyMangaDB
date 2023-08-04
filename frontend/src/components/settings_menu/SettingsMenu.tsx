// SettingsMenu.tsx
import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import ImportExportLibrary from "./ImportExportLibrary";

const SettingsMenu: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);

  const handleClose = () => {
    setMessage(null);
  };

  return (
    <>
      <ImportExportLibrary onMessageChange={setMessage} />

      <Dialog open={!!message} onClose={handleClose}>
        <DialogTitle>Notification</DialogTitle>
        <DialogContent>
          <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingsMenu;
