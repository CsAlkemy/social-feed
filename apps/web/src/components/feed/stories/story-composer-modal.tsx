import { useState } from "react";

import { type User } from "@repo/library";
import { CommonButton, CommonModal, Textarea, toast } from "@repo/ui";

import { ImagePicker } from "@/components/common/image-picker";
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
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createStory = useCreateStory();

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setFile(null);
      setCaption("");
    }
    onOpenChange(next);
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
      handleOpenChange(false);
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
        <ImagePicker
          file={file}
          onChange={setFile}
          label="Click to add a photo"
          alt="Story preview"
          className="mx-auto aspect-[9/16] w-full max-w-56"
          previewClassName="bg-black"
          imageClassName="object-contain"
        />

        <Textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Add a caption (optional)"
          maxLength={200}
          rows={2}
          className="min-h-0 resize-none"
        />
      </div>
    </CommonModal>
  );
}
