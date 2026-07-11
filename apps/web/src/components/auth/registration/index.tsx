import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";

import { registrationFormSchema, type RegistrationFormInput } from "@repo/library";
import { CommonButton, CommonCheckbox, CommonInput, toast } from "@repo/ui";

import { AuthLayout } from "@/components/auth/layout/auth-layout";

export function RegistrationComponent() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegistrationFormInput>({
    resolver: standardSchemaResolver(registrationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
    },
  });

  const onSubmit = handleSubmit(() => {
    toast.info("Registration is not connected yet", {
      description: "The auth API is the next step.",
    });
  });

  return (
    <AuthLayout
      subtitle="Get Started Now"
      title="Registration"
      illustration="registration"
      footerText="Already have an account?"
      footerLinkText="Login"
      footerHref="/auth/login"
    >
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
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
        <CommonInput
          control={control}
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
        />
        <CommonInput
          control={control}
          name="confirmPassword"
          type="password"
          label="Repeat Password"
          autoComplete="new-password"
        />

        <CommonCheckbox
          control={control}
          name="agreedToTerms"
          label={<>I agree to terms &amp; conditions</>}
          containerClassName="mt-1"
        />

        <CommonButton type="submit" size="lg" loading={isSubmitting} className="mt-6 w-full">
          Register now
        </CommonButton>
      </form>
    </AuthLayout>
  );
}
