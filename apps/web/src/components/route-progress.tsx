import Router from "next/router";
import NProgress from "nprogress";
import { useEffect } from "react";

type RouteChangeOptions = { shallow?: boolean };

export function RouteProgress() {
  useEffect(() => {
    NProgress.configure({ showSpinner: false, trickleSpeed: 120 });

    // Shallow route changes (query-only updates for tabs/filters) complete synchronously
    // and would just flash the bar, so they are skipped.
    const handleStart = (_url: string, options?: RouteChangeOptions) => {
      if (!options?.shallow) {
        NProgress.start();
      }
    };
    const handleDone = (_url: string, options?: RouteChangeOptions) => {
      if (!options?.shallow) {
        NProgress.done();
      }
    };
    const handleError = (_error: unknown, _url: string, options?: RouteChangeOptions) => {
      if (!options?.shallow) {
        NProgress.done();
      }
    };

    Router.events.on("routeChangeStart", handleStart);
    Router.events.on("routeChangeComplete", handleDone);
    Router.events.on("routeChangeError", handleError);

    return () => {
      Router.events.off("routeChangeStart", handleStart);
      Router.events.off("routeChangeComplete", handleDone);
      Router.events.off("routeChangeError", handleError);
    };
  }, []);

  return null;
}
