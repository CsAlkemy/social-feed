import * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ theme, ...props }: ToasterProps) {
  const [resolvedTheme, setResolvedTheme] = React.useState<ToasterProps["theme"]>("light");

  React.useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      setResolvedTheme(root.classList.contains("dark") ? "dark" : "light");
    };

    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Sonner
      theme={theme ?? resolvedTheme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: "inherit",
          borderRadius: "6px",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
export { toast } from "sonner";
