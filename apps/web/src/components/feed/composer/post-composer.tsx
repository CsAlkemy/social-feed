import Image from "next/image";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import {
  ChevronDownIcon,
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  LockIcon,
  PencilLineIcon,
  SendIcon,
  XIcon,
} from "lucide-react";

import { PostVisibility, type User } from "@repo/library";
import { Card, CommonButton, CommonDropdown, UserAvatar } from "@repo/ui";

export interface CreatePostInput {
  content: string;
  imageUrls: string[];
  visibility: PostVisibility;
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

const DISABLED_ATTACHMENTS = [{ label: "Article", icon: FileTextIcon }] as const;

export function PostComposer({
  user,
  onCreate,
}: {
  user: User;
  onCreate: (input: CreatePostInput) => void;
}) {
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<PostVisibility>(PostVisibility.PUBLIC);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullName = `${user.firstName} ${user.lastName}`;
  const canPost = content.trim().length > 0 || imageUrls.length > 0;
  const activeVisibility =
    VISIBILITY_OPTIONS.find((option) => option.value === visibility) ?? VISIBILITY_OPTIONS[0];

  const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setImageUrls((previous) => [...previous, ...files.map((file) => URL.createObjectURL(file))]);
    event.target.value = "";
  };

  const handleRemoveImage = (url: string) => {
    URL.revokeObjectURL(url);
    setImageUrls((previous) => previous.filter((existing) => existing !== url));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canPost) return;
    onCreate({ content: content.trim(), imageUrls, visibility });
    setContent("");
    setImageUrls([]);
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

        {imageUrls.length > 0 ? (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {imageUrls.map((url) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-md">
                <Image src={url} alt="Attached photo preview" fill unoptimized className="object-cover" />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => handleRemoveImage(url)}
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
            {DISABLED_ATTACHMENTS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                disabled
                aria-label={`${label} (coming soon)`}
                title={`${label} attachments are coming soon`}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/50"
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
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
            <CommonButton type="submit" disabled={!canPost}>
              <SendIcon className="size-4" />
              Post
            </CommonButton>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelectImages}
          className="hidden"
          aria-hidden
          tabIndex={-1}
        />
      </form>
    </Card>
  );
}
