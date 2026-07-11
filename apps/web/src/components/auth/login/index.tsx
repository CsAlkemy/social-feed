import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";

import { loginFormSchema, type LoginFormInput } from "@repo/library";
import { CommonButton, CommonCheckbox, CommonInput, toast } from "@repo/ui";

import { AuthLayout } from "@/components/auth/layout/auth-layout";

export function LoginView() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormInput>({
    resolver: standardSchemaResolver(loginFormSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = handleSubmit(() => {
    toast.info("Login is not connected yet", {
      description: "The auth API is the next step.",
    });
  });

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

        <CommonButton type="submit" size="lg" loading={isSubmitting} className="mt-6 w-full">
          Login now
        </CommonButton>
      </form>
    </AuthLayout>
  );
}
