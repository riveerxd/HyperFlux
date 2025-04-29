import { PrismaClient } from "@prisma/client"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('Auth attempt for identifier:', credentials?.identifier)

          if (!credentials?.identifier || !credentials?.password) {
            console.log('Missing credentials')
            return null
          }

          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.identifier },
                { name: credentials.identifier }
              ]
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true
            }
          })

          if (!user) {
            console.log('User not found')
            return null
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!passwordMatch) {
            console.log('Password mismatch')
            return null
          }

          console.log('Auth successful for user:', user.email)
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        } finally {
          await prisma.$disconnect()
        }
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("user object: " + JSON.stringify(user) + " token object: " + JSON.stringify(token) + "\n" + "token id: " + token.id + "\n" + "token role: " + token.role)
      if (user) {
        token.id = user.id
        //@ts-expect-error error
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = String(token.id)
        //@ts-expect-error error
        session.user.role = token.role
      }
      return session
    }
  },
  debug: process.env.NODE_ENV === 'development'
}
