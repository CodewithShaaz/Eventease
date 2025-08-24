import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 1. Check if email and password were provided
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 2. Find the user in the database
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null; // User not found
        }

        // 3. Compare the provided password with the hashed password in the database
        const isPasswordValid = bcrypt.compareSync(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null; // Passwords don't match
        }

        // 4. If everything is valid, return the user object
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    // Use 'jwt' as a literal type, not a general string
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      // Include role in JWT token when user signs in
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Include role in session object
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
