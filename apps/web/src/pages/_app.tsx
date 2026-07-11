import type { AppProps } from "next/app";
import { Poppins } from "next/font/google";

import { Toaster } from "@repo/ui";

import { RouteProgress } from "@/components/common/route-progress";

import "nprogress/nprogress.css";
import "@/styles/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <> 
    <style jsx global>{`
        :root {
          --font-poppins: ${poppins.style.fontFamily};
        }
      `}</style>
      <RouteProgress />
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}
