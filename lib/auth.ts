import type { AuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/auth/login',
        signUp: '/auth/register',
        error: '/auth/error',
    },
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                username: { label: 'اسم المستخدم', type: 'text' },
                password: { label: 'كلمة المرور', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error('اسم المستخدم وكلمة المرور مطلوبان')
                }

                const user = await prisma.user.findUnique({
                    where: {
                        username: credentials.username
                    }
                })

                if (!user || !user.password) {
                    throw new Error('المستخدم غير موجود')
                }

                const isPasswordValid = await compare(credentials.password, user.password)

                if (!isPasswordValid) {
                    throw new Error('كلمة المرور غير صحيحة')
                }

                return {
                    id: user.username,
                    username: user.username,
                    title: user.title,
                    email: user.email,
                    userType: user.userType,
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.username = user.username
                token.userType = user.userType
                token.title = user.title
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.username = token.username as string
                session.user.userType = token.userType as string
                session.user.title = token.title as string | undefined
            }
            return session
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
}