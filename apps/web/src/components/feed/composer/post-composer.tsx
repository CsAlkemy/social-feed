import { useState, type FormEvent } from "react";

import {
  CalendarDaysIcon,
  ImageIcon,
  PencilLineIcon,
  SendIcon,
} from "lucide-react";

import { PostVisibility, type CreatePostInput, type User } from "@repo/library";
import { Card, CommonButton, toast, UserAvatar } from "@repo/ui";

import { ImageAttachmentGrid } from "@/components/common/image-attachment-grid";
import { ImagePickerButton } from "@/components/common/image-picker-button";
import { CreateEventModal } from "@/components/events/create-event-modal";
import { VisibilityDropdown } from "@/components/feed/visibility-dropdown";
import { uploadPostImage } from "@/lib/upload";

interface ComposerImage {
  file: File;
  preview: string;
}

export function PostComposer({
  user,
  onCreate,
}: {
  user: User;
  onCreate: (input: CreatePostInput) => Promise<unknown>;
}) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ComposerImage[]>([]);
  const [visibility, setVisibility] = useState<PostVisibility>(PostVisibility.PUBLIC);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const fullName = `${user.firstName} ${user.lastName}`;
  const canPost = content.trim().length > 0 || images.length > 0;

  const handleSelectImages = (files: File[]) => {
    setImages((previous) => [
      ...previous,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  };

  const handleRemoveImage = (preview: string) => {
    URL.revokeObjectURL(preview);
    setImages((previous) => previous.filter((image) => image.preview !== preview));
  };

  const reset = () => {
    images.forEach((image) => URL.revokeObjectURL(image.preview));
    setContent("");
    setImages([]);
    setVisibility(PostVisibility.PUBLIC);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canPost || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const imageUrls = await Promise.all(
        images.map((image) => uploadPostImage(image.file)),
      );
      await onCreate({ content: content.trim(), imageUrls, visibility });
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to publish your post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          <UserAvatar name={fullName} src={user.avatarUrl} className="size-10" />
          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write something ..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <PencilLineIcon className="size-4 text-muted-foreground" />
        </div>

        <ImageAttachmentGrid
          images={images.map((image) => ({ key: image.preview, src: image.preview }))}
          onRemove={handleRemoveImage}
          className="mt-4"
        />

        <div className="mt-5 flex items-center justify-between gap-2 rounded-md bg-secondary p-2">
          <div className="flex items-center">
            <ImagePickerButton
              onSelect={handleSelectImages}
              aria-label="Attach a photo"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ImageIcon className="size-4" />
              <span className="hidden sm:inline">Photo</span>
            </ImagePickerButton>
            <button
              type="button"
              aria-label="Create an event"
              onClick={() => setIsEventModalOpen(true)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <CalendarDaysIcon className="size-4" />
              <span className="hidden sm:inline">Event</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <VisibilityDropdown
              value={visibility}
              onChange={setVisibility}
              triggerClassName="px-2.5 py-2 text-muted-foreground"
              labelClassName="hidden sm:inline"
            />
            <CommonButton type="submit" disabled={!canPost} loading={isSubmitting}>
              <SendIcon className="size-4" />
              Post
            </CommonButton>
          </div>
        </div>
      </form>

      <CreateEventModal open={isEventModalOpen} onOpenChange={setIsEventModalOpen} />
    </Card>
  );
}
