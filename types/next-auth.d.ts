// types/next-auth.d.ts
import 'next-auth'

declare module 'next-auth' {
    interface User {
        username: string
        userType: string
        title?: string
    }

    interface Session {
        user: {
            username: string
            userType: string
            title?: string
            email?: string
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        username: string
        userType: string
        title?: string
    }
}

// types/quiz.ts - Enhanced types
