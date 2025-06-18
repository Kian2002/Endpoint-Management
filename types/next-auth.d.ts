import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      company?: string;
      subscriptionPlan?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    company?: string;
    subscriptionPlan?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    company?: string;
    subscriptionPlan?: string;
  }
} 