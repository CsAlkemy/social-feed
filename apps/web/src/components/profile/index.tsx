import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";

import { updateProfileSchema, type UpdateProfileInput, type User } from "@repo/library";
import { useApiMutation } from "@repo/library/apis";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CommonButton,
  CommonImageUpload,
  CommonInput,
  toast,
} from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";

import { sessionKey, useSession } from "@/hooks/use-auth";
import { uploadImage } from "@/lib/upload";

interface UpdateProfileResponse {
  user: User;
}

export function ProfileComponent() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { control, handleSubmit, watch, setValue, formState } = useForm<UpdateProfileInput>({
    resolver: standardSchemaResolver(updateProfileSchema),
    values: user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatarUrl: user.avatarUrl ?? null,
        }
      : undefined,
  });

  const updateProfile = useApiMutation<UpdateProfileResponse, UpdateProfileInput>(
    "users",
    "me",
    "patch",
    {
      onSuccess: ({ user: updated }) => {
        queryClient.setQueryData(sessionKey, updated);
        toast.success("Profile updated");
      },
      onError: (error) => {
        toast.error(error.message || "Unable to update profile right now");
      },
    },
  );

  const onSubmit = handleSubmit((values) => updateProfile.mutate(values));
  const avatarUrl = watch("avatarUrl");

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
          <CardDescription>Update your photo and personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-6" noValidate>
            <CommonImageUpload
              fallback={fullName}
              value={avatarUrl ?? null}
              uploader={uploadImage}
              onChange={(next) => setValue("avatarUrl", next, { shouldDirty: true })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <CommonInput
                control={control}
                name="firstName"
                label="First name"
                autoComplete="given-name"
              />
              <CommonInput
                control={control}
                name="lastName"
                label="Last name"
                autoComplete="family-name"
              />
            </div>

            <CommonInput
              control={control}
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
            />

            <div className="flex justify-end">
              <CommonButton
                type="submit"
                size="lg"
                loading={updateProfile.isLoading}
                disabled={!formState.isDirty}
              >
                Save changes
              </CommonButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
