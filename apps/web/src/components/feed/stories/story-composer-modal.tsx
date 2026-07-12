import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";

import { ImageIcon, XIcon } from "lucide-react";

import type { User } from "@repo/library";
import { CommonButton, CommonModal, toast } from "@repo/ui";

import { useCreateStory } from "@/hooks/use-stories";
import { uploadStoryImage } from "@/lib/upload";

export function StoryComposerModal({
  open,
  onOpenChange,
  currentUser,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: User;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createStory = useCreateStory();

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const reset = () => {
    clearImage();
    setCaption("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    clearImage();
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    event.target.value = "";
  };

  const handleSubmit = async () => {
    if (!file || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const imageUrl = await uploadStoryImage(file);
      await createStory.mutateAsync({
        imageUrl,
        caption: caption.trim() || undefined,
      });
      toast.success("Story shared");
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to share your story");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CommonModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Create a story"
      description={`Share a moment as ${currentUser.firstName}. Stories disappear after 24 hours.`}
      footer={
        <>
          <CommonButton variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </CommonButton>
          <CommonButton onClick={handleSubmit} disabled={!file} loading={isSubmitting}>
            Share Story
          </CommonButton>
        </>
      }
    >
      <div className="space-y-4">
        {preview ? (
          <div className="relative mx-auto aspect-[9/16] w-full max-w-56 overflow-hidden rounded-lg bg-black">
            <Image src={preview} alt="Story preview" fill unoptimized className="object-contain" />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={clearImage}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mx-auto flex aspect-[9/16] w-full max-w-56 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ImageIcon className="size-8" />
            <span className="text-sm font-medium">Click to add a photo</span>
          </button>
        )}

        <textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Add a caption (optional)"
          maxLength={200}
          rows={2}
          className="w-full resize-none rounded-md bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleSelect}
          className="hidden"
          aria-hidden
          tabIndex={-1}
        />
      </div>
    </CommonModal>
  );
}
