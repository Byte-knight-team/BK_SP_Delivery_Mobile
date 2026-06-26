import { Stack } from 'expo-router'

/**
 * Auth Group Layout — stack navigator for unauthenticated screens.
 *
 * Currently only contains the login screen, but this group can
 * be extended later with forgot-password, register, etc.
 *
 * The (auth) parentheses make this a "group" — it won't appear
 * in the URL path. Routes resolve as /(auth)/login → /login.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  )
}
