import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import SignUpForm from "./SignUpForm";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <div>
      <SignUpForm />
    </div>
  );
}
