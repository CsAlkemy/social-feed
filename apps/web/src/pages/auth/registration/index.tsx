import { RegistrationComponent } from "@/components/auth/registration";
import Head from "next/head";

export default function RegistrationPage() {
  return (
    <>
      <Head>
        <title>Registration | Appifylab Social</title>
      </Head>
      <RegistrationComponent />
    </>
  );
}
