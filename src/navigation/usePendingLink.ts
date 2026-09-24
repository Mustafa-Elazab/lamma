import { useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';

import { parseIncomingLink, type PendingLink } from './linking';

/** Same URL delivered twice in this window (initial URL + url event) is ignored. */
const DUPLICATE_WINDOW_MS = 1500;

/**
 * Single entry point for invite links (`/e/{id}` and `/g/{code}`, over HTTPS
 * or `lamma://`). Covers cold start (`getInitialURL`), background and
 * foreground (`url` events). The link is held until `ready` (auth +
 * onboarding done and the app stack mounted), then opened exactly once.
 * Opening a link only navigates; it never RSVPs, joins or submits anything.
 */
export function usePendingLink(
  open: (link: PendingLink) => boolean,
  ready: boolean,
): void {
  const [pending, setPending] = useState<PendingLink | null>(null);
  const last = useRef<{ url: string; at: number } | null>(null);

  useEffect(() => {
    const capture = (url: string | null | undefined) => {
      if (!url) {
        return;
      }
      const now = Date.now();
      if (last.current?.url === url && now - last.current.at < DUPLICATE_WINDOW_MS) {
        return;
      }
      last.current = { url, at: now };
      const link = parseIncomingLink(url);
      if (link) {
        setPending(link);
      }
    };

    Linking.getInitialURL()
      .then(capture)
      .catch(() => undefined);
    const subscription = Linking.addEventListener('url', ({ url }) => capture(url));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!ready || !pending) {
      return;
    }
    if (open(pending)) {
      setPending(null);
      return;
    }
    // Navigation container not mounted yet: retry briefly.
    const timer = setInterval(() => {
      if (open(pending)) {
        clearInterval(timer);
        setPending(null);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [open, pending, ready]);
}
