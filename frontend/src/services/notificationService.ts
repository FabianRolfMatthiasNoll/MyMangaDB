export type NotificationSeverity = "success" | "error" | "warning" | "info";

export interface Notification {
  message: string;
  severity: NotificationSeverity;
}

type Listener = (notification: Notification) => void;

const listeners = new Set<Listener>();

/**
 * Subscribe to notifications.
 *
 * Returns an unsubscribe function.
 */
export const subscribeToNotifications = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Show a notification.
 *
 * Plain modules such as the API error handler are not React components, so
 * they cannot render a snackbar themselves. They publish the message here
 * and the notification host - a component mounted once in the app - picks it
 * up.
 */
export const notify = (
  message: string,
  severity: NotificationSeverity = "info"
): void => {
  listeners.forEach((listener) => listener({ message, severity }));
};
