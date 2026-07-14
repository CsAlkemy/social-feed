import { useEffect, useState } from "react";

import { ImageIcon } from "lucide-react";

import { PostVisibility, type Post } from "@repo/library";
import { CommonButton, CommonModal, Label, Textarea, toast } from "@repo/ui";

import { ImageAttachmentGrid } from "@/components/common/image-attachment-grid";
import { ImagePickerButton } from "@/components/common/image-picker-button";
import { VisibilityDropdown } from "@/components/feed/visibility-dropdown";
import { useUpdatePost } from "@/hooks/use-posts";
import { uploadPostImage } from "@/lib/upload";

type EditImage =
  | { kind: "existing"; key: string; url: string }
  | { kind: "new"; key: string; file: File; preview: string };

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

  const handleSelectImages = (files: File[]) => {
    setImages((previous) => [
      ...previous,
      ...files.map((file) => ({
        kind: "new" as const,
        key: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
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
          <Label htmlFor="edit-post-content">Content</Label>
          <Textarea
            id="edit-post-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={4}
            placeholder="Write something ..."
          />
        </div>

        <ImageAttachmentGrid
          images={images.map((image) => ({ key: image.key, src: previewOf(image) }))}
          onRemove={handleRemoveImage}
        />

        <div className="flex items-center justify-between gap-2">
          <ImagePickerButton
            onSelect={handleSelectImages}
            className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ImageIcon className="size-4" />
            Add photo
          </ImagePickerButton>

          <div className="grid gap-2">
            <Label>Visibility</Label>
            <VisibilityDropdown
              value={visibility}
              onChange={setVisibility}
              triggerClassName="border border-input px-3 py-2"
            />
          </div>
        </div>
      </div>
    </CommonModal>
  );
}
