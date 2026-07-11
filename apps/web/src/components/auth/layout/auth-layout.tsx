import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@repo/ui";

export interface AuthLayoutProps {
  subtitle: string;
  title: string;
  illustration: "login" | "registration";
  footerText: string;
  footerLinkText: string;
  footerHref: string;
  children: ReactNode;
}

const ILLUSTRATIONS = {
  login: { src: "/images/login.png", width: 1269, height: 1240, className: "max-w-[520px]" },
  registration: {
    src: "/images/registration.png",
    width: 1928,
    height: 1422,
    className: "max-w-[680px]",
  },
} as const;

export function AuthLayout({
  subtitle,
  title,
  illustration,
  footerText,
  footerLinkText,
  footerHref,
  children,
}: AuthLayoutProps) {
  const image = ILLUSTRATIONS[illustration];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Image
        src="/images/shape1.svg"
        alt=""
        width={176}
        height={540}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 -z-10 hidden lg:block"
      />
      <Image
        src="/images/shape2.svg"
        alt=""
        width={568}
        height={400}
        aria-hidden
        className="pointer-events-none absolute right-5 top-0 -z-10 hidden lg:block"
      />
      <Image
        src="/images/shape3.svg"
        alt=""
        width={568}
        height={548}
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-[327px] -z-10 hidden lg:block"
      />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="hidden lg:col-span-7 lg:block">
            <Image
              src={image.src}
              alt=""
              width={image.width}
              height={image.height}
              sizes="(max-width: 1023px) 1px, 50vw"
              className={cn("mx-auto h-auto w-full", image.className)}
            />
          </div>

          <div className="mx-auto w-full max-w-lg rounded-md bg-card p-5 sm:p-10 lg:col-span-5 lg:mx-0">
            <div className="mb-5 text-center">
              <Link href="/" aria-label="Appifylab Social home" className="inline-block">
                <Image src="/images/logo.svg" alt="Buddy Script" width={158} height={33} priority />
              </Link>
            </div>
            <p className="mb-2 text-center text-base text-muted-foreground">{subtitle}</p>
            <h1 className="mb-8 text-center text-2xl font-semibold leading-snug text-card-foreground sm:mb-10 sm:text-[28px]">
              {title}
            </h1>

            {children}

            <p className="mt-10 text-center text-sm text-muted-foreground">
              {footerText}{" "}
              <Link href={footerHref} className="font-medium text-primary hover:underline">
                {footerLinkText}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
