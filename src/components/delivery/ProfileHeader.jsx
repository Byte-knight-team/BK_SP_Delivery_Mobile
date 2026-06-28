import { useState, useEffect } from 'react'
import { View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../theme/colors'

/**
 * ProfileHeader — welcome banner with live clock.
 * Migrated from web frontend's ProfileHeader.jsx.
 *
 * Displays a gradient card with:
 * - Live date and time (updates every second)
 * - Greeting with the driver's name
 */
export default function ProfileHeader({ name }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const timeParts = formatTime(currentTime).split(' ')

  return (
    <View className="mx-6 mb-6 rounded-[32px] overflow-hidden shadow-sm shadow-orange-200">
      <LinearGradient
        colors={['#FF6B00', '#FF8C00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 32 }}
      >
        {/* Decorative background elements */}
        <View className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white opacity-10 rounded-full" />
        <View className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-black opacity-5 rounded-full" />

        <View className="relative z-10 items-center">
          <Text className="text-[11px] text-white/90 font-bold uppercase tracking-[3px] mb-2">
            {formatDate(currentTime)}
          </Text>

          <View className="flex-row items-baseline mb-3">
            <Text className="text-[56px] font-black text-white tracking-tighter">
              {timeParts[0]}
            </Text>
            <Text className="text-2xl font-black text-white/90 ml-1">{timeParts[1]}</Text>
          </View>

          <View className="h-px w-12 bg-white/30 mb-4" />

          <Text className="text-[22px] font-bold text-white mb-1">Hello, {name || 'Driver'}!</Text>
          <Text className="text-[13px] text-white/80 font-medium">
            Ready for your next delivery?
          </Text>
        </View>
      </LinearGradient>
    </View>
  )
}
