"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type LoadingState = {
  active: boolean;
  message: string;
  helper: string;
};

const DEFAULT_MESSAGE = "Loading your cozy space...";
const DEFAULT_HELPER = "Just a moment while HabitHug gets things ready ✨";

function isSamePageUrl(url: URL) {
  return url.pathname === window.location.pathname && url.search === window.location.search && url.hash === window.location.hash;
}

function messageForUrl(url: URL) {
  if (url.pathname.startsWith("/battle")) {
    return {
      message: "Opening Battle...",
      helper: "Loading your friendly challenge room 🏆"
    };
  }

  if (url.pathname.startsWith("/rewards")) {
    return {
      message: "Opening Rewards...",
      helper: "Gathering your cute badges ⭐"
    };
  }

  if (url.pathname.startsWith("/habits")) {
    return {
      message: "Opening Habit...",
      helper: "Preparing your habit details 🌱"
    };
  }

  if (url.pathname.startsWith("/settings")) {
    return {
      message: "Opening Settings...",
      helper: "Loading your preferences ⚙️"
    };
  }

  if (url.pathname.startsWith("/login")) {
    return {
      message: "Opening Login...",
      helper: "Taking you to your cozy sign-in page 🌸"
    };
  }

  if (url.pathname.startsWith("/register")) {
    return {
      message: "Opening Signup...",
      helper: "Preparing your new HabitHug space 🐰"
    };
  }

  return {
    message: DEFAULT_MESSAGE,
    helper: DEFAULT_HELPER
  };
}

export function GlobalLoadingProvider() {
  const pathname = usePathname();
  const [loading, setLoading] = useState<LoadingState>({
    active: false,
    message: DEFAULT_MESSAGE,
    helper: DEFAULT_HELPER
  });
  const timerRef = useRef<number | null>(null);

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function show(message = DEFAULT_MESSAGE, helper = DEFAULT_HELPER, delay = 160) {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      setLoading({ active: true, message, helper });
    }, delay);
  }

  function hide() {
    clearTimer();
    setLoading((current) => ({ ...current, active: false }));
  }

  useEffect(() => {
    hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (isSamePageUrl(url)) return;

      const copy = messageForUrl(url);
      show(anchor.dataset.loadingMessage || copy.message, anchor.dataset.loadingHelper || copy.helper);
    }

    function onCustomLoading(event: Event) {
      const custom = event as CustomEvent<{
        active?: boolean;
        message?: string;
        helper?: string;
        delay?: number;
      }>;

      if (custom.detail?.active === false) {
        hide();
        return;
      }

      show(
        custom.detail?.message || DEFAULT_MESSAGE,
        custom.detail?.helper || DEFAULT_HELPER,
        custom.detail?.delay ?? 160
      );
    }

    function onPageShow() {
      hide();
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("habithug:loading", onCustomLoading as EventListener);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("habithug:loading", onCustomLoading as EventListener);
      window.removeEventListener("pageshow", onPageShow);
      clearTimer();
    };
  }, []);

  if (!loading.active) return null;

  return (
    <div className="global-loading-overlay" role="status" aria-live="polite" aria-label={loading.message}>
      <div className="form-loading-card global-loading-card">
        <div className="loading-logo">💖</div>
        <div className="loading-spinner" aria-hidden="true" />
        <h2>{loading.message}</h2>
        <p>{loading.helper}</p>
      </div>
    </div>
  );
}
