import { Stack } from 'expo-router'

/**
 * Dashboard Stack Layout — nested stack navigator within the Dashboard tab.
 *
 * Provides push/pop navigation between:
 *   - index   → Dashboard screen (assigned orders list)
 *   - order/[id] → Order detail screen (status transitions)
 *
 * This mirrors the web's route structure:
 *   /delivery/dashboard      → Dashboard
 *   /delivery/orders/:id     → Order Detail
 */
export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  )
}
