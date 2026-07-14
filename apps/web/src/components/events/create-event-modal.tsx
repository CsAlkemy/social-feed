import { useState } from "react";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";

import { eventFormSchema, type EventFormInput } from "@repo/library";
import {
  CommonButton,
  CommonInput,
  CommonModal,
  CommonTextarea,
  toast,
} from "@repo/ui";

import { ImagePicker } from "@/components/common/image-picker";
import { useCreateEvent } from "@/hooks/use-events";
import { uploadEventImage } from "@/lib/upload";

const EMPTY_FORM: EventFormInput = {
  title: "",
  startsAt: "",
  location: "",
  description: "",
};

export function CreateEventModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const createEvent = useCreateEvent();

  const { control, handleSubmit, reset } = useForm<EventFormInput>({
    resolver: standardSchemaResolver(eventFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setFile(null);
      reset(EMPTY_FORM);
    }
    onOpenChange(next);
  };

  const isSubmitting = isUploading || createEvent.isPending;

  const onSubmit = handleSubmit(async (values) => {
    if (isSubmitting) return;

    let coverUrl: string | undefined;
    if (file) {
      setIsUploading(true);
      try {
        coverUrl = await uploadEventImage(file);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to upload the cover photo",
        );
        return;
      } finally {
        setIsUploading(false);
      }
    }

    createEvent.mutate(
      {
        title: values.title,
        description: values.description || undefined,
        location: values.location || undefined,
        coverUrl,
        startsAt: new Date(values.startsAt).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Event created");
          handleOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message || "Unable to create the event");
        },
      },
    );
  });

  return (
    <CommonModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Create an event"
      description="Plan something and let people know they can join."
      footer={
        <>
          <CommonButton variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </CommonButton>
          <CommonButton onClick={() => void onSubmit()} loading={isSubmitting}>
            Create Event
          </CommonButton>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        <ImagePicker
          file={file}
          onChange={setFile}
          label="Add a cover photo (optional)"
          alt="Event cover preview"
          className="aspect-video w-full"
          imageClassName="object-cover"
        />

        <CommonInput
          control={control}
          name="title"
          label="Title"
          placeholder="What is your event called?"
        />
        <CommonInput
          control={control}
          name="startsAt"
          type="datetime-local"
          label="Date and time"
        />
        <CommonInput
          control={control}
          name="location"
          label="Location (optional)"
          placeholder="Where is it happening?"
        />
        <CommonTextarea
          control={control}
          name="description"
          label="Description (optional)"
          placeholder="Tell people what to expect"
          rows={3}
        />
      </form>
    </CommonModal>
  );
}
