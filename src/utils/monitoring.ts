export class Monitor {
  static logError(error: Error, context?: string) {
    if (import.meta.env.DEV) {
      console.error(`[${context || 'Error'}]`, error);
    }
    // In production, integrate with Sentry/LogRocket here in future
  }

  static logEvent(name: string, data?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      console.log(`[Event: ${name}]`, data);
    }
    // In production, integrate with Analytics
  }

  static init() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', event => {
        this.logError(event.error, 'Global Error');
      });

      window.addEventListener('unhandledrejection', event => {
        this.logError(new Error(String(event.reason)), 'Unhandled Rejection');
      });
    }
  }
}
