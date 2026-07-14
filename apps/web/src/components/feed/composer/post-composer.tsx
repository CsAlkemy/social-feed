import Image from "next/image";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import {
  CalendarDaysIcon,
  ChevronDownIcon,
  GlobeIcon,
  ImageIcon,
  LockIcon,
  PencilLineIcon,
  SendIcon,
  XIcon,
} from "lucide-react";

import {
  PostVisibility,
  UPLOAD_IMAGE_ACCEPT,
  type CreatePostInput,
  type User,
} from "@repo/library";
import { Card, CommonButton, CommonDropdown, toast, UserAvatar } from "@repo/ui";

import { CreateEventModal } from "@/components/events/create-event-modal";
import { uploadPostImage } from "@/lib/upload";

interface ComposerImage {
  file: File;
  preview: string;
}

const VISIBILITY_OPTIONS = [
  {
    value: PostVisibility.PUBLIC,
    label: "Public",
    hint: "Anyone can see this post",
    icon: GlobeIcon,
  },
  {
    value: PostVisibility.PRIVATE,
    label: "Private",
    hint: "Only you can see this post",
    icon: LockIcon,
  },
] as const;

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullName = `${user.firstName} ${user.lastName}`;
  const canPost = content.trim().length > 0 || images.length > 0;
  const activeVisibility =
    VISIBILITY_OPTIONS.find((option) => option.value === visibility) ?? VISIBILITY_OPTIONS[0];

  const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setImages((previous) => [
      ...previous,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    event.target.value = "";
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

        {images.length > 0 ? (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((image) => (
              <div key={image.preview} className="relative aspect-square overflow-hidden rounded-md">
                <Image src={image.preview} alt="Attached photo preview" fill unoptimized className="object-cover" />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => handleRemoveImage(image.preview)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-2 rounded-md bg-secondary p-2">
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Attach a photo"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ImageIcon className="size-4" />
              <span className="hidden sm:inline">Photo</span>
            </button>
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
            <CommonDropdown
              trigger={
                <button
                  type="button"
                  aria-label={`Post visibility: ${activeVisibility.label}`}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <activeVisibility.icon className="size-4" />
                  <span className="hidden sm:inline">{activeVisibility.label}</span>
                  <ChevronDownIcon className="size-3.5" />
                </button>
              }
              items={VISIBILITY_OPTIONS.map(({ value, label, hint, icon: Icon }) => ({
                icon: <Icon className="size-4" />,
                label: (
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">{hint}</span>
                  </span>
                ),
                onSelect: () => setVisibility(value),
              }))}
            />
            <CommonButton type="submit" disabled={!canPost} loading={isSubmitting}>
              <SendIcon className="size-4" />
              Post
            </CommonButton>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={UPLOAD_IMAGE_ACCEPT}
          multiple
          onChange={handleSelectImages}
          className="hidden"
          aria-hidden
          tabIndex={-1}
        />
      </form>

      <CreateEventModal open={isEventModalOpen} onOpenChange={setIsEventModalOpen} />
    </Card>
  );
}
