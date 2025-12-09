import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    fullname: string;
    email: string;
    image: string;
    isPrivate: boolean;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      fullname: string;
      email: string;
      image: string;
      isPrivate: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    fullname: string;
    email: string;
    image: string;
    isPrivate: boolean;
  }
}
