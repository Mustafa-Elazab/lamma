type DevLogger = {
  display: (config: {
    name: string;
    value?: unknown;
    preview?: string;
    important?: boolean;
  }) => void;
  log: (...args: unknown[]) => void;
  error: (message: unknown, stack: unknown) => void;
};

let devLogger: DevLogger | null = null;

export function attachDevLogger(logger: DevLogger): void {
  if (__DEV__) {
    devLogger = logger;
  }
}

export const appLogger = {
  display(name: string, value?: unknown, preview?: string): void {
    if (__DEV__) {
      devLogger?.display({ name, value, preview });
    }
  },

  log(message: string, details?: unknown): void {
    console.info(message, details ?? '');
    if (__DEV__) {
      devLogger?.log(message, details);
    }
  },

  error(message: string, error: unknown, details?: unknown): void {
    const normalized = error instanceof Error ? error : new Error(String(error));
    console.error(message, {
      error: normalized.message,
      stack: normalized.stack,
      details,
    });
    if (__DEV__) {
      devLogger?.error(message, normalized.stack ?? normalized.message);
      devLogger?.display({
        name: message,
        value: { error: normalized.message, details },
        preview: normalized.message,
        important: true,
      });
    }
  },
};
