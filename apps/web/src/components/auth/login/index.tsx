import { useRouter } from "next/router";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";

import {
  loginFormSchema,
  type LoginFormInput,
  type LoginInput,
} from "@repo/library";
import { setAccessToken, useApiMutation } from "@repo/library/apis";
import { CommonButton, CommonCheckbox, CommonInput, toast } from "@repo/ui";

import { AuthLayout } from "@/components/auth/layout/auth-layout";
import { setAuthHint, type AuthResponse } from "@/lib/auth";

export function LoginView() {
  const router = useRouter();

  const { control, handleSubmit } = useForm<LoginFormInput>({
    resolver: standardSchemaResolver(loginFormSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const login = useApiMutation<AuthResponse, LoginInput>("auth", "login", "post", {
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken);
      setAuthHint(true);
      void router.push("/feed");
    },
    onError: (error) => {
      toast.error(error.message || "Unable to login right now");
    },
  });

  const onSubmit = handleSubmit((values) => login.mutate(values));

  return (
    <AuthLayout
      subtitle="Welcome back"
      title="Login to your account"
      illustration="login"
      footerText="Dont have an account?"
      footerLinkText="Create New Account"
      footerHref="/auth/registration"
    >
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
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
          autoComplete="current-password"
        />

        <div className="mt-1 flex items-center justify-between">
          <CommonCheckbox control={control} name="rememberMe" label="Remember me" />
          <p className="text-sm font-medium text-primary">Forgot password?</p>
        </div>

        <CommonButton
          type="submit"
          size="lg"
          loading={login.isLoading || login.isSuccess}
          className="mt-6 w-full"
        >
          Login now
        </CommonButton>
      </form>
    </AuthLayout>
  );
}
