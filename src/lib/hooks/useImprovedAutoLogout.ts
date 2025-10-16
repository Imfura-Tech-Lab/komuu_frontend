import { useState, useEffect, useRef, useCallback } from "react";
import { showErrorToast } from "@/components/layouts/auth-layer-out";

interface UseAutoLogoutProps {
  onLogout: (showMessage?: boolean) => void;
  isAuthenticated: boolean;
  timeoutDuration?: number;
  warningDuration?: number;
}

interface UseAutoLogoutReturn {
  lastActivity: number;
  showWarningModal: boolean;
  warningTimeRemaining: number;
  extendSession: () => void;
  forceLogout: () => void;
}

const DEFAULT_TIMEOUT = 30 * 60 * 1000;
const DEFAULT_WARNING = 2 * 60 * 1000;

export function useImprovedAutoLogout({
  onLogout,
  isAuthenticated,
  timeoutDuration = DEFAULT_TIMEOUT,
  warningDuration = DEFAULT_WARNING,
}: UseAutoLogoutProps): UseAutoLogoutReturn {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningTimeRemaining, setWarningTimeRemaining] = useState(0);

  // @ts-ignore
  const activityTimeoutRef = useRef<NodeJS.Timeout>();
  // @ts-ignore
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  // @ts-ignore
  const checkIntervalRef = useRef<NodeJS.Timeout>();

  const isLoggingOutRef = useRef(false);

  // Activity tracking
  const updateLastActivity = useCallback(() => {
    if (!isAuthenticated || isLoggingOutRef.current) return;

    setLastActivity(Date.now());

    // Hide warning modal if user becomes active
    if (showWarningModal) {
      setShowWarningModal(false);
      setWarningTimeRemaining(0);
    }
  }, [isAuthenticated, showWarningModal]);

  const forceLogout = useCallback(() => {
    if (isLoggingOutRef.current) return;

    isLoggingOutRef.current = true;
    setShowWarningModal(false);

    // Clear all timers
    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);

    showErrorToast("Your session has expired due to inactivity.");
    onLogout(false);
  }, [onLogout]);

  // Extend session
  const extendSession = useCallback(() => {
    updateLastActivity();
    setShowWarningModal(false);
    setWarningTimeRemaining(0);
  }, [updateLastActivity]);

  // Show warning modal
  const showWarning = useCallback(() => {
    if (isLoggingOutRef.current || showWarningModal) return;

    setShowWarningModal(true);
    setWarningTimeRemaining(Math.floor(warningDuration / 1000));

    // Final logout timer
    warningTimeoutRef.current = setTimeout(forceLogout, warningDuration);
  }, [showWarningModal, warningDuration, forceLogout]);

  // Activity monitoring setup
  useEffect(() => {
    if (!isAuthenticated) {
      isLoggingOutRef.current = false;
      return;
    }

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "keydown",
    ];

    // Add event listeners with passive flag for better performance
    events.forEach((event) => {
      document.addEventListener(event, updateLastActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateLastActivity);
      });
    };
  }, [updateLastActivity, isAuthenticated]);

  // Session timeout monitoring
  useEffect(() => {
    if (!isAuthenticated || isLoggingOutRef.current) {
      // Clear all timers when not authenticated
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      return;
    }

    // Check activity every 30 seconds for more precise timing
    const checkActivity = () => {
      if (isLoggingOutRef.current || showWarningModal) return;

      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      const timeUntilWarning =
        timeoutDuration - warningDuration - timeSinceLastActivity;

      if (timeSinceLastActivity >= timeoutDuration) {
        // Immediate logout - session fully expired
        forceLogout();
      } else if (timeUntilWarning <= 0 && !showWarningModal) {
        // Show warning
        showWarning();
      }
    };

    // Start checking immediately, then every 30 seconds
    checkActivity();
    checkIntervalRef.current = setInterval(checkActivity, 30000);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [
    isAuthenticated,
    lastActivity,
    timeoutDuration,
    warningDuration,
    showWarningModal,
    forceLogout,
    showWarning,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, []);

  return {
    lastActivity,
    showWarningModal,
    warningTimeRemaining,
    extendSession,
    forceLogout,
  };
}
