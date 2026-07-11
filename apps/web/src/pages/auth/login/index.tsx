import Head from "next/head";
import { LoginView } from "@/components/auth/login";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login | Appifylab Social</title>
      </Head>
      <LoginView />
    </>
  );
}
