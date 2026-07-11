import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import Head from "next/head";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PostVisibility } from "@repo/library";
import { CommonButton } from "@repo/ui/common/common-button";
import { CommonDropdown } from "@repo/ui/common/common-dropdown";
import { CommonInput } from "@repo/ui/common/common-input";
import { CommonModal } from "@repo/ui/common/common-modal";
import { CommonRadioGroup } from "@repo/ui/common/common-radio";
import { CommonSelect } from "@repo/ui/common/common-select";
import { CommonTextarea } from "@repo/ui/common/common-textarea";
import { PostSkeleton, CommentSkeleton } from "@repo/ui/common/post-skeleton";
import { SearchInput } from "@repo/ui/common/search-input";
import { UserAvatar } from "@repo/ui/common/user-avatar";
import { Button } from "@repo/ui/schadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/schadcn/card";
import { toast } from "@repo/ui/schadcn/sonner";

const previewSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  bio: z.string().min(10, "Tell us a bit more (at least 10 characters)"),
  visibility: z.enum(PostVisibility),
  gender: z.string().min(1, "Please pick one"),
});

type PreviewInput = z.infer<typeof previewSchema>;

export default function ComponentsPreviewPage() {
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { control, handleSubmit, reset } = useForm<PreviewInput>({
    resolver: standardSchemaResolver(previewSchema),
    defaultValues: {
      firstName: "",
      email: "",
      password: "",
      bio: "",
      visibility: PostVisibility.PUBLIC,
      gender: "",
    },
  });

  const onSubmit = (values: PreviewInput) => {
    toast.success("Form is valid", { description: `Welcome, ${values.firstName}!` });
    reset();
  };

  const simulateLoading = () => {
    setLoadingDemo(true);
    setTimeout(() => {
      setLoadingDemo(false);
      toast.success("Done!", { description: "The async action finished." });
    }, 2000);
  };

  return (
    <>
      <Head>
        <title>Components Preview | Appifylab Social</title>
      </Head>
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-10">
        <div>
          <h1 className="text-2xl font-semibold text-card-foreground">Components preview</h1>
          <p className="text-sm text-muted-foreground">
            Shared components from <code>@repo/ui</code>, themed to the provided design.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>CommonButton with variants and loading state</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <CommonButton>Login now</CommonButton>
            <CommonButton variant="outline">Outline</CommonButton>
            <CommonButton variant="secondary">Secondary</CommonButton>
            <CommonButton variant="ghost">Ghost</CommonButton>
            <CommonButton variant="destructive">Delete</CommonButton>
            <CommonButton variant="link">Link</CommonButton>
            <CommonButton loading={loadingDemo} onClick={simulateLoading}>
              {loadingDemo ? "Saving..." : "Click to load"}
            </CommonButton>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form components</CardTitle>
            <CardDescription>
              react-hook-form + zod via CommonInput, CommonTextarea, CommonSelect and
              CommonRadioGroup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <CommonInput
                  control={control}
                  name="firstName"
                  label="First name"
                  placeholder="Jane"
                />
                <CommonInput
                  control={control}
                  name="email"
                  label="Email"
                  placeholder="jane@example.com"
                />
              </div>
              <CommonInput
                control={control}
                name="password"
                type="password"
                label="Password"
                placeholder="At least 8 characters"
              />
              <CommonTextarea
                control={control}
                name="bio"
                label="Bio"
                placeholder="What's on your mind?"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <CommonSelect
                  control={control}
                  name="visibility"
                  label="Post visibility"
                  options={[
                    { label: "Public", value: PostVisibility.PUBLIC },
                    { label: "Only me", value: PostVisibility.PRIVATE },
                  ]}
                />
                <CommonRadioGroup
                  control={control}
                  name="gender"
                  label="Gender"
                  orientation="horizontal"
                  options={[
                    { label: "Male", value: "male" },
                    { label: "Female", value: "female" },
                    { label: "Other", value: "other" },
                  ]}
                />
              </div>
              <div>
                <CommonButton type="submit" size="lg">
                  Submit form
                </CommonButton>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search, modal, dropdown &amp; toast</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              onSearch={(value) => toast.info("Searching", { description: value || "(empty)" })}
              placeholder="input search text"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => setModalOpen(true)}>
                Open modal
              </Button>
              <CommonDropdown
                trigger={<Button variant="secondary">Open dropdown</Button>}
                items={[
                  { type: "label", label: "Post actions" },
                  { label: "Edit post", onSelect: () => toast.info("Edit selected") },
                  { label: "Copy link", onSelect: () => toast.success("Link copied") },
                  { type: "separator" },
                  {
                    label: "Delete post",
                    destructive: true,
                    onSelect: () => toast.error("Post deleted"),
                  },
                ]}
              />
              <Button variant="ghost" onClick={() => toast.warning("Heads up", { description: "This is a sonner toast." })}>
                Show toast
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avatars &amp; skeletons</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="flex items-center gap-3">
              <UserAvatar name="Jane Doe" />
              <UserAvatar name="Karim Saif" className="size-12" />
              <UserAvatar name="Radovan SkillArena" className="size-14" />
            </div>
            <CommentSkeleton />
            <PostSkeleton />
          </CardContent>
        </Card>

        <CommonModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Create post"
          description="This is the shared CommonModal built on the shadcn dialog."
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <CommonButton
                onClick={() => {
                  setModalOpen(false);
                  toast.success("Post created");
                }}
              >
                Post
              </CommonButton>
            </>
          }
        >
          <p className="text-sm text-foreground">
            Modal body content goes here — forms, confirmation text, anything.
          </p>
        </CommonModal>
      </main>
    </>
  );
}
