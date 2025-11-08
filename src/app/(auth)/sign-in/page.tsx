import { SignIn } from "./SignInForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/");
  }
  return (
    <main>
      <SignIn />
    </main>
  );
}
