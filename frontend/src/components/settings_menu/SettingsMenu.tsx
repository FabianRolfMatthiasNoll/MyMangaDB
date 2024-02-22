import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import ImportExportLibrary from "./ImportExportLibrary";
import { useAuth } from '../../AuthContext';
import AuthorizationModal from '../AuthorizationModal';

const SettingsMenu: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthorized, setIsAuthorized, isLoggedIn, setIsLoggedIn } = useAuth();

  const handleClose = () => {
    setMessage(null);
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setIsLoggedIn(false);
    localStorage.removeItem('isAuthorized');
    localStorage.removeItem('isLoggedIn');
    setMessage("You have been logged out.");
  };

  const handleLoginPrompt = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <>
      {isLoggedIn && <ImportExportLibrary onMessageChange={setMessage} />}

      {isAuthorized && (
        <Button onClick={isLoggedIn ? handleLogout : handleLoginPrompt} color="primary">
          {isLoggedIn ? "Logout" : "Login"}
        </Button>
      )}

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

      {/* Authorization Modal */}
      <AuthorizationModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
};

export default SettingsMenu;
