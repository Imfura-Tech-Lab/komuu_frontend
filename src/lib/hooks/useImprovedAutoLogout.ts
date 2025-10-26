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
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningTimeRemaining, setWarningTimeRemaining] = useState(0);

  const lastActivityRef = useRef(Date.now());
  const isAuthenticatedRef = useRef(isAuthenticated);
  const isLoggingOutRef = useRef(false);

  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mainCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const updateLastActivity = useCallback(() => {
    if (!isAuthenticatedRef.current || isLoggingOutRef.current) return;

    lastActivityRef.current = Date.now();

    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    if (warningCountdownIntervalRef.current) clearInterval(warningCountdownIntervalRef.current);
    if (mainCheckIntervalRef.current) clearInterval(mainCheckIntervalRef.current);

    if (showWarningModal) {
      setShowWarningModal(false);
      setWarningTimeRemaining(0);
    }
    
    if (mainCheckIntervalRef.current) {
        clearInterval(mainCheckIntervalRef.current);
    }
    mainCheckIntervalRef.current = setInterval(checkActivity, 1000);
  }, [showWarningModal]);

  const forceLogout = useCallback((showMessage: boolean = true) => {
    if (isLoggingOutRef.current) return;

    isLoggingOutRef.current = true;
    setShowWarningModal(false);
    setWarningTimeRemaining(0);

    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    if (warningCountdownIntervalRef.current) clearInterval(warningCountdownIntervalRef.current);
    if (mainCheckIntervalRef.current) clearInterval(mainCheckIntervalRef.current);

    if (showMessage) {
      showErrorToast("Your session has expired due to inactivity.");
    }
    onLogout(false);
  }, [onLogout]);

  const showWarning = useCallback(() => {
    if (isLoggingOutRef.current || showWarningModal) return;

    setShowWarningModal(true);
    setWarningTimeRemaining(Math.floor(warningDuration / 1000));

    if (warningCountdownIntervalRef.current) clearInterval(warningCountdownIntervalRef.current);

    warningCountdownIntervalRef.current = setInterval(() => {
      setWarningTimeRemaining((prev) => {
        if (prev <= 1) {
          if (warningCountdownIntervalRef.current) clearInterval(warningCountdownIntervalRef.current);
          forceLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [showWarningModal, warningDuration, forceLogout]);

  const checkActivity = useCallback(() => {
    if (!isAuthenticatedRef.current || isLoggingOutRef.current) {
      setShowWarningModal(false);
      setWarningTimeRemaining(0);
      return;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    const warningThreshold = timeoutDuration - warningDuration;

    if (timeSinceLastActivity >= timeoutDuration) {
      forceLogout();
    } else if (timeSinceLastActivity >= warningThreshold && !showWarningModal) {
      showWarning();
    }
  }, [
    timeoutDuration,
    warningDuration,
    showWarningModal,
    forceLogout,
    showWarning,
  ]);

  const extendSession = useCallback(() => {
    if (isLoggingOutRef.current) return;
    updateLastActivity();
  }, [updateLastActivity]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
      if (warningCountdownIntervalRef.current) clearInterval(warningCountdownIntervalRef.current);
      if (mainCheckIntervalRef.current) clearInterval(mainCheckIntervalRef.current);
      setShowWarningModal(false);
      setWarningTimeRemaining(0);
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

    events.forEach((event) => {
      document.addEventListener(event, updateLastActivity, { passive: true });
    });

    if (mainCheckIntervalRef.current) clearInterval(mainCheckIntervalRef.current);
    mainCheckIntervalRef.current = setInterval(checkActivity, 1000);

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateLastActivity);
      });
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
      if (warningCountdownIntervalRef.current) clearInterval(warningCountdownIntervalRef.current);
      if (mainCheckIntervalRef.current) clearInterval(mainCheckIntervalRef.current);
    };
  }, [isAuthenticated, updateLastActivity, checkActivity]);

  useEffect(() => {
    return () => {
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
      if (warningCountdownIntervalRef.current) clearInterval(warningCountdownIntervalRef.current);
      if (mainCheckIntervalRef.current) clearInterval(mainCheckIntervalRef.current);
    };
  }, []);

  return {
    lastActivity: lastActivityRef.current,
    showWarningModal,
    warningTimeRemaining,
    extendSession,
    forceLogout,
  };
}