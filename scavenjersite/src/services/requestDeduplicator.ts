/**
 * Request deduplicator to prevent multiple identical requests
 */
export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async execute<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Check if there's already a pending request
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Create new request and store promise
    const promise = requestFn()
      .then(result => {
        // Clean up after success
        this.pendingRequests.delete(key);
        return result;
      })
      .catch(error => {
        // Clean up after error
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear(): void {
    this.pendingRequests.clear();
  }
}

// Singleton instance
export const requestDeduplicator = new RequestDeduplicator();
