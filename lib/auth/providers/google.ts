import GoogleProvider from "next-auth/providers/google";
// 1️⃣ Customer: Google OAuth
export const customerGoogleProvider = GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code",
      scope: "openid email profile",
    },
  },
  profile(profile) {
    return {
      id: profile.sub,
      email: profile.email,
      name: profile.name,
      image: profile.picture,
      role: "CUSTOMER", // Default role for OAuth users
    };
  },
});
