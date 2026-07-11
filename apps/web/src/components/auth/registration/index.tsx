import { useRouter } from "next/router";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";

import {
  registrationFormSchema,
  type RegistrationFormInput,
  type RegistrationInput,
} from "@repo/library";
import { setAccessToken, useApiMutation } from "@repo/library/apis";
import { CommonButton, CommonCheckbox, CommonInput, toast } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";

import { AuthLayout } from "@/components/auth/layout/auth-layout";
import { sessionKey } from "@/hooks/use-auth";
import { setAuthHint, type AuthResponse } from "@/lib/auth";

export function RegistrationComponent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { control, handleSubmit } = useForm<RegistrationFormInput>({
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

  const register = useApiMutation<AuthResponse, RegistrationInput>(
    "auth",
    "register",
    "post",
    {
      onSuccess: ({ user, accessToken }) => {
        setAccessToken(accessToken);
        setAuthHint(true);
        queryClient.setQueryData(sessionKey, user);
        void router.push("/feed");
      },
      onError: (error) => {
        toast.error(error.message || "Unable to register right now");
      },
    },
  );

  const onSubmit = handleSubmit((values) => register.mutate(values));

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

        <CommonButton
          type="submit"
          size="lg"
          loading={register.isLoading || register.isSuccess}
          className="mt-6 w-full"
        >
          Register now
        </CommonButton>
      </form>
    </AuthLayout>
  );
}
