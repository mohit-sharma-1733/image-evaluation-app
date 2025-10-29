import { cookies } from "next/headers"

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin-session")
  
  if (!session) {
    return null
  }
  
  try {
    // In a real app, you'd verify JWT or decrypt session
    // For this demo, we just check if cookie exists
    return { username: session.value }
  } catch (error) {
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session) {
    throw new Error("Unauthorized")
  }
  
  return session
}
