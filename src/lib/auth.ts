// auth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CustomAdapter from "@/lib/CustomAdapter"; // Import your custom adapter
import pool from "@/lib/db";
import type { Adapter } from "@auth/core/adapters";

// This helper function lets TypeScript infer types for the adapter automatically
export function createAdapter(adapter: Adapter): Adapter {
  return adapter;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use the createAdapter helper to handle type inference
  adapter: createAdapter(CustomAdapter(pool)),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      const email = user.email;
      if (!email) return false;

      // Only allow users who exist in your custom admin table
      const { rows } = await pool.query(
        `SELECT * FROM authorized_users WHERE email = $1 AND deleted_at IS NULL`,
        [email]
      );

      return rows.length > 0;
    },
  },

  pages: {
    signIn: "/",
    error: "/unauthorized", // Error code passed in query string as ?error=
  },

  session: {
    strategy: "database",
  },
});