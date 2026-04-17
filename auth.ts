import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const loginRes = await axios.post(`${API_URL}/token/login/`, {
            email: credentials.email,
            password: credentials.password,
          })

          const auth_token = loginRes.data.auth_token
          if (!auth_token) return null

          const userRes = await axios.get(`${API_URL}/auth/data/`, {
            headers: { Authorization: `Token ${auth_token}` },
          })

          return { ...userRes.data, auth_token }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.auth_token = (user as { auth_token: string }).auth_token
        token.userData = user
      }
      // Re-fetch user data when session.update() is called (e.g. after Steam connect)
      if (trigger === 'update' && token.auth_token) {
        try {
          const res = await axios.get(`${API_URL}/auth/data/`, {
            headers: { Authorization: `Token ${token.auth_token}` },
          })
          token.userData = { ...res.data, auth_token: token.auth_token }
        } catch { /* keep existing data */ }
      }
      return token
    },
    session({ session, token }) {
      ;(session as { auth_token?: string }).auth_token = token.auth_token as string
      session.user = token.userData as typeof session.user
      return session
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
})
