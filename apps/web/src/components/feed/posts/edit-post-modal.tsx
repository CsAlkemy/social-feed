import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { ChevronDownIcon, GlobeIcon, ImageIcon, LockIcon, XIcon } from "lucide-react";

import { PostVisibility, UPLOAD_IMAGE_ACCEPT, type Post } from "@repo/library";
import { CommonButton, CommonDropdown, CommonModal, Textarea, toast } from "@repo/ui";

import { useUpdatePost } from "@/hooks/use-posts";
import { uploadPostImage } from "@/lib/upload";

type EditImage =
  | { kind: "existing"; key: string; url: string }
  | { kind: "new"; key: string; file: File; preview: string };

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

const previewOf = (image: EditImage) =>
  image.kind === "existing" ? image.url : image.preview;

export function EditPostModal({
  post,
  open,
  onOpenChange,
}: {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updatePost = useUpdatePost();
  const [content, setContent] = useState(post.content);
  const [visibility, setVisibility] = useState<PostVisibility>(post.visibility);
  const [images, setImages] = useState<EditImage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setContent(post.content);
    setVisibility(post.visibility);
    setImages(
      post.imageUrls.map((url, index) => ({
        kind: "existing",
        key: `existing-${index}-${url}`,
        url,
      })),
    );
  }, [open, post]);

  const canSave = content.trim().length > 0 || images.length > 0;
  const activeVisibility =
    VISIBILITY_OPTIONS.find((option) => option.value === visibility) ?? VISIBILITY_OPTIONS[0];

  const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setImages((previous) => [
      ...previous,
      ...files.map((file) => ({
        kind: "new" as const,
        key: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
    event.target.value = "";
  };

  const handleRemoveImage = (key: string) => {
    setImages((previous) => {
      const target = previous.find((image) => image.key === key);
      if (target?.kind === "new") URL.revokeObjectURL(target.preview);
      return previous.filter((image) => image.key !== key);
    });
  };

  const handleSave = async () => {
    if (!canSave || isSaving) return;

    setIsSaving(true);
    try {
      const imageUrls = await Promise.all(
        images.map((image) =>
          image.kind === "existing"
            ? Promise.resolve(image.url)
            : uploadPostImage(image.file),
        ),
      );
      await updatePost.mutateAsync({
        postId: post.id,
        input: { content: content.trim(), imageUrls, visibility },
      });
      toast.success("Post updated");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update post");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CommonModal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit post"
      footer={
        <>
          <CommonButton variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </CommonButton>
          <CommonButton onClick={handleSave} disabled={!canSave} loading={isSaving}>
            Save changes
          </CommonButton>
        </>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <span className="text-sm font-medium">Content</span>
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={4}
            placeholder="Write something ..."
          />
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((image) => (
              <div key={image.key} className="relative aspect-square overflow-hidden rounded-md">
                <Image
                  src={previewOf(image)}
                  alt="Post photo"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => handleRemoveImage(image.key)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ImageIcon className="size-4" />
            Add photo
          </button>

          <div className="grid gap-2">
            <span className="text-sm font-medium">Visibility</span>
            <CommonDropdown
              trigger={
                <button
                  type="button"
                  aria-label={`Post visibility: ${activeVisibility.label}`}
                  className="flex items-center gap-1.5 rounded-md border border-input px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <activeVisibility.icon className="size-4" />
                  {activeVisibility.label}
                  <ChevronDownIcon className="size-3.5 text-muted-foreground" />
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
      </div>
    </CommonModal>
  );
}
