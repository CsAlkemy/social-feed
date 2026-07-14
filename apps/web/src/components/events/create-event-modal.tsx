import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ImageIcon, XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { UPLOAD_IMAGE_ACCEPT } from "@repo/library";

import {
  CommonButton,
  CommonInput,
  CommonModal,
  CommonTextarea,
  toast,
} from "@repo/ui";

import { useCreateEvent } from "@/hooks/use-events";
import { uploadEventImage } from "@/lib/upload";

const eventFormSchema = z.object({
  title: z.string().trim().min(1, "Give your event a title").max(120),
  startsAt: z.string().min(1, "Pick a date and time"),
  location: z.string().trim().max(200),
  description: z.string().trim().max(2000),
});

type EventFormInput = z.infer<typeof eventFormSchema>;

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
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createEvent = useCreateEvent();

  const { control, handleSubmit, reset } = useForm<EventFormInput>({
    resolver: standardSchemaResolver(eventFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      clearImage();
      reset(EMPTY_FORM);
    }
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

  const onSubmit = handleSubmit(async (values) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const coverUrl = file ? await uploadEventImage(file) : undefined;
      await createEvent.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        location: values.location || undefined,
        coverUrl,
        startsAt: new Date(values.startsAt).toISOString(),
      });
      toast.success("Event created");
      handleOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create the event",
      );
    } finally {
      setIsSubmitting(false);
    }
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
        {preview ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image src={preview} alt="Event cover preview" fill unoptimized className="object-cover" />
            <button
              type="button"
              aria-label="Remove cover photo"
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
            className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ImageIcon className="size-8" />
            <span className="text-sm font-medium">Add a cover photo (optional)</span>
          </button>
        )}

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

        <input
          ref={fileInputRef}
          type="file"
          accept={UPLOAD_IMAGE_ACCEPT}
          onChange={handleSelect}
          className="hidden"
          aria-hidden
          tabIndex={-1}
        />
      </form>
    </CommonModal>
  );
}
