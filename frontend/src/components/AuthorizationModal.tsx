import React, { useState } from "react";
import { useAuth } from "../AuthContext"; // Adjust the import path as needed
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

interface AuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthorizationModal: React.FC<AuthorizationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setIsAuthorized, setIsLoggedIn } = useAuth();
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (password === "mymangadb") {
      setIsAuthorized(true);
      setIsLoggedIn(true);
      onClose();
    } else {
      alert("Incorrect password");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Sign In
        </Typography>
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <Button onClick={handleLogin} variant="contained" sx={{ mt: 2 }}>
          Authorize
        </Button>
        <Button
          onClick={() => {
            setIsAuthorized(true);
            onClose();
          }}
          variant="text"
          sx={{ mt: 1 }}
        >
          Continue as Guest
        </Button>
      </Box>
    </Modal>
  );
};

export default AuthorizationModal;
