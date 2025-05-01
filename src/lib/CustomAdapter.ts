// import { Pool } from "pg";

// /** @type {import("next-auth/adapters").Adapter} */
// export default function CustomAdapter(pool: Pool) {
//   return {
//     async createUser(user) {
//       console.log("1");
      
//       const result = await pool.query(
//         `INSERT INTO users (name, email, "emailVerified", image)
//         VALUES ($1, $2, $3, $4)
//         RETURNING *`,
//         [user.name, user.email, user.emailVerified, user.image]
//       );
//       return result.rows[0];
//       console.log("1");
//     },
    
//     async getUser(id) {
//       const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
//       return result.rows[0] || null;
//     },

//     async getUserByEmail(email) {
//       const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
//       return result.rows[0] || null;
//     },

//     async getUserByAccount({ provider, providerAccountId }) {
//       const result = await pool.query(
//         `SELECT u.* FROM users u
//          JOIN accounts a ON u.id = a."userId"
//          WHERE a.provider = $1 AND a."providerAccountId" = $2`,
//         [provider, providerAccountId]
//       );
//       return result.rows[0] || null;
//     },

//     async updateUser(user) {
//       const result = await pool.query(
//         `UPDATE users
//          SET name = $1, email = $2, "emailVerified" = $3, image = $4
//          WHERE id = $5
//          RETURNING *`,
//         [user.name, user.email, user.emailVerified, user.image, user.id]
//       );
//       return result.rows[0];
//     },

//     async deleteUser(id) {
//       await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
//     },

//     async linkAccount(account) {
//       await pool.query(
//         `INSERT INTO accounts
//          ("userId", type, provider, "providerAccountId",
//           refresh_token, access_token, expires_at, id_token,
//           scope, session_state, token_type)
//          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
//         [
//           account.userId,
//           account.type,
//           account.provider,
//           account.providerAccountId,
//           account.refresh_token,
//           account.access_token,
//           account.expires_at,
//           account.id_token,
//           account.scope,
//           account.session_state,
//           account.token_type,
//         ]
//       );
//       return account;
//     },

//     async unlinkAccount({ provider, providerAccountId }) {
//       await pool.query(
//         `DELETE FROM accounts WHERE provider = $1 AND "providerAccountId" = $2`,
//         [provider, providerAccountId]
//       );
//     },

//     async getSessionAndUser(sessionToken) {
//       const result = await pool.query(
//         `SELECT s.*, u.*
//          FROM sessions s
//          JOIN users u ON u.id = s."userId"
//          WHERE s."sessionToken" = $1`,
//         [sessionToken]
//       );
//       if (result.rows.length === 0) return null;

//       const row = result.rows[0];

//       const session = {
//         sessionToken: row.sessionToken,
//         userId: row.userId,
//         expires: row.expires,
//       };

//       const user = {
//         id: row.userId,
//         name: row.name,
//         email: row.email,
//         emailVerified: row.emailVerified,
//         image: row.image,
//       };

//       return { session, user };
//     },

//     async createSession(session) {
//       const result = await pool.query(
//         `INSERT INTO sessions ("sessionToken", "userId", expires)
//          VALUES ($1, $2, $3)
//          RETURNING *`,
//         [session.sessionToken, session.userId, session.expires]
//       );
//       return result.rows[0];
//     },

//     async updateSession(session) {
//       const result = await pool.query(
//         `UPDATE sessions
//          SET expires = $1
//          WHERE "sessionToken" = $2
//          RETURNING *`,
//         [session.expires, session.sessionToken]
//       );
//       return result.rows[0] || null;
//     },

//     async deleteSession(sessionToken) {
//       await pool.query(`DELETE FROM sessions WHERE "sessionToken" = $1`, [sessionToken]);
//     },

//     async createVerificationToken(verificationToken) {
//       const result = await pool.query(
//         `INSERT INTO verification_token (identifier, token, expires)
//          VALUES ($1, $2, $3)
//          RETURNING *`,
//         [verificationToken.identifier, verificationToken.token, verificationToken.expires]
//       );
//       return result.rows[0];
//     },

//     async useVerificationToken({ identifier, token }) {
//       const result = await pool.query(
//         `DELETE FROM verification_token
//          WHERE identifier = $1 AND token = $2
//          RETURNING *`,
//         [identifier, token]
//       );
//       return result.rows[0] || null;
//     },
//   };
// }


import {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  VerificationToken,
} from "@auth/core/adapters";
import { Pool } from "pg";

export default function MyAdapter(client: Pool): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      const result = await client.query(
        `INSERT INTO users (name, email, "emailVerified", image)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [user.name, user.email, user.emailVerified, user.image]
      );
      return result.rows[0];
    },

    async getUser(id: string) {
      const result = await client.query(`SELECT * FROM users WHERE id = $1`, [id]);
      return result.rows[0] || null;
    },

    async getUserByEmail(email: string) {
      const result = await client.query(`SELECT * FROM users WHERE email = $1`, [email]);
      return result.rows[0] || null;
    },

    async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      const result = await client.query(
        `SELECT u.* FROM users u
         JOIN accounts a ON u.id = a."userId"
         WHERE a.provider = $1 AND a."providerAccountId" = $2`,
        [provider, providerAccountId]
      );
      return result.rows[0] || null;
    },

    async updateUser(user: Partial<AdapterUser> & { id: string }) {
      const result = await client.query(
        `UPDATE users
         SET name = $1, email = $2, "emailVerified" = $3, image = $4
         WHERE id = $5
         RETURNING *`,
        [user.name, user.email, user.emailVerified, user.image, user.id]
      );
      return result.rows[0];
    },

    async deleteUser(id: string) {
      await client.query(`DELETE FROM users WHERE id = $1`, [id]);
    },

    async linkAccount(account: AdapterAccount) {
      await client.query(
        `INSERT INTO accounts
         ("userId", type, provider, "providerAccountId",
          refresh_token, access_token, expires_at, id_token,
          scope, session_state, token_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          account.userId,
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token,
          account.access_token,
          account.expires_at,
          account.id_token,
          account.scope,
          account.session_state,
          account.token_type,
        ]
      );
      return account;
    },

    async unlinkAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      await client.query(
        `DELETE FROM accounts WHERE provider = $1 AND "providerAccountId" = $2`,
        [provider, providerAccountId]
      );
    },

    async getSessionAndUser(sessionToken: string) {
      const result = await client.query(
        `SELECT s.*, u.*
         FROM sessions s
         JOIN users u ON u.id = s."userId"
         WHERE s."sessionToken" = $1`,
        [sessionToken]
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];

      return {
        session: {
          sessionToken: row.sessionToken,
          userId: row.userId,
          expires: row.expires,
        },
        user: {
          id: row.userId,
          name: row.name,
          email: row.email,
          emailVerified: row.emailVerified,
          image: row.image,
        },
      };
    },

    async createSession(session: AdapterSession) {
      const result = await client.query(
        `INSERT INTO sessions ("sessionToken", "userId", expires)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [session.sessionToken, session.userId, session.expires]
      );
      return result.rows[0];
    },

    async updateSession({ sessionToken, expires }: { sessionToken: string; expires?: Date }) {
      const result = await client.query(
        `UPDATE sessions
         SET expires = $1
         WHERE "sessionToken" = $2
         RETURNING *`,
        [expires, sessionToken]
      );
      return result.rows[0] || null;
    },

    async deleteSession(sessionToken: string) {
      await client.query(`DELETE FROM sessions WHERE "sessionToken" = $1`, [sessionToken]);
    },

    async createVerificationToken(token: VerificationToken) {
      const result = await client.query(
        `INSERT INTO verification_token (identifier, token, expires)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [token.identifier, token.token, token.expires]
      );
      return result.rows[0];
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      const result = await client.query(
        `DELETE FROM verification_token
         WHERE identifier = $1 AND token = $2
         RETURNING *`,
        [identifier, token]
      );
      return result.rows[0] || null;
    },
  };
}