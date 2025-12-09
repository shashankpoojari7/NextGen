import type { NextAuthOptions } from "next-auth";
import dbConnect from "@/database/dbConnection";
import User from "@/models/user.model";
import { generateUniqueUsername } from "@/lib/generateUsername";

import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Identifier", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials: any) {
        try {
          if (!credentials?.identifier || !credentials?.password) {
            throw new Error("Missing identifier or password");
          }
          await dbConnect();
          const user = await User.findOne({
            $or: [
              { email: credentials.identifier.trim().toLowerCase() },
              { username: credentials.identifier.trim().toLowerCase() },
              { mobile: credentials.identifier.trim() },
            ],
          });

          if (!user) throw new Error("No user found with this Email, Username or Mobile Number");
          if (user.authProvider !== "credentials")
            throw new Error(`Please log in using your ${user.authProvider} account`);
          if (!user.password) throw new Error("This account does not have a password set");

          const isValidPassword = await user.isPasswordCorrect(credentials.password);
          if (!isValidPassword) throw new Error("Incorrect password");

          return {
            id: user._id.toString(),
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            image: user.profile_image || "",
            isPrivate: user.isPrivate,
          };
        } catch (error: any) {
          console.error("Authorize Error:", error.message);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();
      if (!account) return true;

      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        const baseUsername = user.email?.split("@")[0] || "user";
        const uniqueUsername = await generateUniqueUsername(baseUsername);

        const newUser = new User({
          email: user.email,
          fullname: user.name,
          username: uniqueUsername,
          authProvider: account.provider,
          emailVerified: new Date(),
          profile_image: "",
        });

        await newUser.save();

        user.id = newUser._id.toString();
        user.username = newUser.username;
        user.email = newUser.email;
        user.fullname = newUser.fullname;
        user.image = newUser.profile_image || "";
        user.isPrivate = newUser.isPrivate;
      } 
      else {
        if (existingUser.authProvider !== account.provider) {
          existingUser.authProvider = account.provider;
        }

        if (user.image && !existingUser.profile_image) {
          existingUser.profile_image = user.image;
        }

        if (!existingUser.emailVerified) {
          existingUser.emailVerified = new Date();
        }

        await existingUser.save();

        user.id = existingUser._id.toString();
        user.username = existingUser.username;
        user.email = existingUser.email;
        user.fullname = existingUser.fullname;
        user.image = existingUser.profile_image || "";
        user.isPrivate = existingUser.isPrivate;
      }

      return true;
    },

    async redirect({ url }) {
      return url;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.fullname = user.fullname;
        token.image = user.image;
        token.isPrivate = user.isPrivate;
      }
      if (trigger === "update") {
        const freshUser = await User.findById(token.id).select(
          "username email fullname profile_image isPrivate"
        );

        if (freshUser) {
          token.username = freshUser.username;
          token.email = freshUser.email;
          token.fullname = freshUser.fullname;
          token.image = freshUser.profile_image ?? "";
          token.isPrivate = freshUser.isPrivate;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user = session.user || {};

      session.user.id = token.id as string;
      session.user.username = token.username as string;
      session.user.email = token.email as string;
      session.user.fullname = token.fullname as string;
      session.user.image = token.image as string;
      session.user.isPrivate = token.isPrivate as boolean;

      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60,
  },

  jwt: { secret: process.env.NEXTAUTH_SECRET },

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
};
