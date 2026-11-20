import React, { useCallback, useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import {
  Notification,
  subscribeToNotifications,
} from "../services/notificationService";

/**
 * Renders the notifications published through the notification service.
 *
 * Notifications are queued so that a burst of errors does not hide each
 * other - every message is shown in turn.
 */
const NotificationHost: React.FC = () => {
  const [queue, setQueue] = useState<Notification[]>([]);

  useEffect(
    () =>
      subscribeToNotifications((notification) =>
        setQueue((q) => [...q, notification]),
      ),
    [],
  );

  const handleClose = useCallback(() => {
    setQueue((q) => q.slice(1));
  }, []);

  const current = queue[0];

  return (
    <Snackbar
      // Every notification gets its own snackbar. Without the key the
      // second message reuses the first one, and its timer - which only
      // restarts when the snackbar opens - never runs again, so the message
      // stays on screen forever.
      key={current?.id ?? "empty"}
      open={!!current}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={handleClose}
        severity={current?.severity ?? "info"}
        variant="filled"
        sx={{ width: "100%" }}
      >
        <span style={{ whiteSpace: "pre-line" }}>{current?.message ?? ""}</span>
      </Alert>
    </Snackbar>
  );
};

export default NotificationHost;
