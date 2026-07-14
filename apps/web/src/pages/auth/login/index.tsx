import { LoginView } from "@/components/auth/login";
import { PageTitle } from "@/components/common/page-title";

export default function LoginPage() {
  return (
    <>
      <PageTitle title="Login" />
      <LoginView />
    </>
  );
}
