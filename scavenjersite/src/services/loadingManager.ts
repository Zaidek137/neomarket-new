import { useState, useEffect } from 'react';

type LoadingState = {
  isLoading: boolean;
  message?: string;
  progress?: number;
};

class LoadingManager {
  private listeners: Map<string, (state: LoadingState) => void> = new Map();
  private states: Map<string, LoadingState> = new Map();

  setLoading(key: string, state: LoadingState) {
    this.states.set(key, state);
    this.notifyListeners();
  }

  clearLoading(key: string) {
    this.states.delete(key);
    this.notifyListeners();
  }

  getLoadingState(key: string): LoadingState | undefined {
    return this.states.get(key);
  }

  isAnyLoading(): boolean {
    for (const state of this.states.values()) {
      if (state.isLoading) return true;
    }
    return false;
  }

  getAllLoadingStates(): Map<string, LoadingState> {
    return new Map(this.states);
  }

  subscribe(id: string, callback: (state: LoadingState) => void) {
    this.listeners.set(id, callback);
  }

  unsubscribe(id: string) {
    this.listeners.delete(id);
  }

  private notifyListeners() {
    const isLoading = this.isAnyLoading();
    const combinedState: LoadingState = {
      isLoading,
      message: this.getActiveMessage(),
    };

    this.listeners.forEach(callback => {
      callback(combinedState);
    });
  }

  private getActiveMessage(): string | undefined {
    for (const state of this.states.values()) {
      if (state.isLoading && state.message) {
        return state.message;
      }
    }
    return undefined;
  }
}

// Singleton instance
export const loadingManager = new LoadingManager();

/**
 * React hook for using the loading manager
 */
export function useGlobalLoading() {
  const [state, setState] = useState<LoadingState>({ isLoading: false });

  useEffect(() => {
    const id = Math.random().toString(36).substr(2, 9);

    const handleUpdate = (newState: LoadingState) => {
      setState(newState);
    };

    loadingManager.subscribe(id, handleUpdate);

    // Set initial state
    setState({
      isLoading: loadingManager.isAnyLoading(),
      message: loadingManager.getActiveMessage(),
    });

    return () => {
      loadingManager.unsubscribe(id);
    };
  }, []);

  return state;
}

/**
 * Utility function to wrap async operations with loading state
 */
export async function withLoading<T>(
  key: string,
  message: string,
  operation: () => Promise<T>
): Promise<T> {
  loadingManager.setLoading(key, { isLoading: true, message });
  
  try {
    const result = await operation();
    return result;
  } finally {
    loadingManager.clearLoading(key);
  }
}
