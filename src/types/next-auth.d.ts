import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    _id: string; 
    username: string;
    email: string;
    fullname: string;
    image: string | '';
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      _id: string;
      username: string;
      email: string;
      image: string | null;
      fullname: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    _id: string;
    username: string;
    email: string;
    picture?: string | null;
    fullname: string;
  }
}
