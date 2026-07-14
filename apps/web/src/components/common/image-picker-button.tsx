import { useRef, type ChangeEvent, type ComponentProps } from "react";

import { UPLOAD_IMAGE_ACCEPT } from "@repo/library";

export function ImagePickerButton({
  onSelect,
  children,
  ...props
}: Omit<ComponentProps<"button">, "onClick" | "onSelect" | "type"> & {
  onSelect: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) onSelect(files);
    event.target.value = "";
  };

  return (
    <>
      <button type="button" onClick={() => inputRef.current?.click()} {...props}>
        {children}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_IMAGE_ACCEPT}
        multiple
        onChange={handleChange}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />
    </>
  );
}
