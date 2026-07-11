import { useState } from "react";

import type { AppProps } from "next/app";
import { Poppins } from "next/font/google";
import Router from "next/router";

import { isApiError } from "@repo/library";
import { configureApi } from "@repo/library/apis";
import { Toaster } from "@repo/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { RouteProgress } from "@/components/common/route-progress";
import { setAuthHint } from "@/lib/auth";

import "nprogress/nprogress.css";
import "@/styles/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => {
    configureApi({
      baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
      refreshPath: "/auth/refresh",
      onUnauthorized: () => {
        setAuthHint(false);
        if (!Router.pathname.startsWith("/auth")) {
          void Router.replace("/auth/login");
        }
      },
    });

    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          refetchOnWindowFocus: false,
          retry: (failureCount, error) =>
            isApiError(error) && error.status < 500 ? false : failureCount < 2,
        },
        mutations: { retry: false },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      <style jsx global>{`
        :root {
          --font-poppins: ${poppins.style.fontFamily};
        }
      `}</style>
      <RouteProgress />
      <Component {...pageProps} />
      <Toaster />
    </QueryClientProvider>
  );
}
