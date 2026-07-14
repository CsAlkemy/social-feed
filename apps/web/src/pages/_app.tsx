import { useState, type ReactElement, type ReactNode } from "react";

import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { Poppins } from "next/font/google";

import { isApiError } from "@repo/library";
import { configureApi } from "@repo/library/apis";
import { Toaster } from "@repo/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/components/common/auth-provider";
import { RouteProgress } from "@/components/common/route-progress";
import { sessionKey } from "@/hooks/use-auth";
import { setAuthHint } from "@/lib/auth";

import "nprogress/nprogress.css";
import "@/styles/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export type NextPageWithLayout<P = object> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  const [queryClient] = useState(() => {
    const client = new QueryClient({
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

    configureApi({
      baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "https://buddy-script-api.up.railway.app/api",
      refreshPath: "/auth/refresh",
      onUnauthorized: () => {
        setAuthHint(false);
        client.setQueryData(sessionKey, null);
      },
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <style jsx global>{`
        :root {
          --font-poppins: ${poppins.style.fontFamily};
        }
      `}</style>
      <RouteProgress />
      <AuthProvider>{getLayout(<Component {...pageProps} />)}</AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
