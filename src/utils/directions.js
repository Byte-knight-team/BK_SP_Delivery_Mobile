/**
 * directions.js — Google Directions API utility
 *
 * Fetches a driving route between two coordinate pairs and decodes the
 * polyline so it can be drawn directly on a react-native-maps <Polyline>.
 *
 * Usage:
 *   import { getDirections } from '../utils/directions'
 *   const { polylineCoords, durationText, distanceText } = await getDirections(
 *     { lat: 6.9271, lng: 79.8612 },  // restaurant (origin)
 *     { lat: 6.9350, lng: 79.8500 }   // customer  (destination)
 *   )
 */

const GOOGLE_MAPS_API_KEY = 'AIzaSyCeQps-AfE_UdL8ytGmcvbNNuuO7N3HMnc'

/**
 * Decodes a Google Maps encoded polyline string into an array of
 * { latitude, longitude } objects that react-native-maps understands.
 *
 * Algorithm: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
function decodePolyline(encoded) {
  const points = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let shift = 0
    let result = 0
    let byte

    // Decode latitude chunk
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1
    lat += deltaLat

    shift = 0
    result = 0

    // Decode longitude chunk
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1
    lng += deltaLng

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    })
  }

  return points
}

/**
 * Calls the Google Directions API and returns:
 * - polylineCoords: Array of { latitude, longitude } for drawing the route
 * - durationText:   Human-readable ETA, e.g. "12 mins"
 * - distanceText:   Human-readable distance, e.g. "3.2 km"
 *
 * Returns null for all values if the API call fails (map still renders,
 * just without the route polyline).
 */
export async function getDirections(origin, destination) {
  const defaultResult = {
    polylineCoords: [],
    durationText: null,
    distanceText: null,
  }

  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
    return defaultResult
  }

  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${origin.lat},${origin.lng}` +
    `&destination=${destination.lat},${destination.lng}` +
    `&mode=driving` +
    `&key=${GOOGLE_MAPS_API_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' || !data.routes?.length) {
      console.warn('[directions] API returned non-OK status:', data.status)
      return defaultResult
    }

    const route = data.routes[0]
    const leg = route.legs[0]

    return {
      polylineCoords: decodePolyline(route.overview_polyline.points),
      durationText: leg?.duration?.text ?? null,
      distanceText: leg?.distance?.text ?? null,
    }
  } catch (error) {
    console.error('[directions] Failed to fetch route:', error)
    return defaultResult
  }
}
