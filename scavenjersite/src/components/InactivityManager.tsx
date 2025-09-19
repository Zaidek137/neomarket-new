import { useEffect, useCallback } from 'react';
import { useDisconnect, useActiveWallet } from 'thirdweb/react';

const InactivityManager = () => {
  const { disconnect } = useDisconnect();
  const activeWallet = useActiveWallet();

  const disconnectWallet = useCallback(() => {
    if (activeWallet) {
      console.log('User inactive, disconnecting wallet.');
      disconnect(activeWallet);
    }
  }, [disconnect, activeWallet]);

  const resetTimer = useCallback(() => {
    clearTimeout(window.inactivityTimer);
    window.inactivityTimer = setTimeout(disconnectWallet, 15 * 60 * 1000); // 15 minutes
  }, [disconnectWallet]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    resetTimer(); // Start the timer initially

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimeout(window.inactivityTimer);
    };
  }, [resetTimer]);

  return null; // This component does not render anything
};

// Augment the Window interface
declare global {
  interface Window {
    inactivityTimer: NodeJS.Timeout;
  }
}

export default InactivityManager; 