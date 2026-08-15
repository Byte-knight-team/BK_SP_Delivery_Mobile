/**
 * fonts.js — Inter font family design tokens
 *
 * Every weight of Inter is loaded via @expo-google-fonts/inter in the
 * root layout. Use these constants in StyleSheet.create() calls instead
 * of raw font name strings so typos are caught at build time.
 *
 * NativeWind / Tailwind usage:
 *   font-inter-thin       → Inter_100Thin
 *   font-inter-extralight → Inter_200ExtraLight
 *   font-inter-light      → Inter_300Light
 *   font-inter            → Inter_400Regular  (default)
 *   font-inter-medium     → Inter_500Medium
 *   font-inter-semibold   → Inter_600SemiBold
 *   font-inter-bold       → Inter_700Bold
 *   font-inter-extrabold  → Inter_800ExtraBold
 *   font-inter-black      → Inter_900Black
 */
export const fonts = {
  thin:       'Inter_100Thin',
  extraLight: 'Inter_200ExtraLight',
  light:      'Inter_300Light',
  regular:    'Inter_400Regular',
  medium:     'Inter_500Medium',
  semiBold:   'Inter_600SemiBold',
  bold:       'Inter_700Bold',
  extraBold:  'Inter_800ExtraBold',
  black:      'Inter_900Black',
}
