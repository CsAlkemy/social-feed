import { RegistrationComponent } from "@/components/auth/registration";
import { PageTitle } from "@/components/common/page-title";

export default function RegistrationPage() {
  return (
    <>
      <PageTitle title="Registration" />
      <RegistrationComponent />
    </>
  );
}
