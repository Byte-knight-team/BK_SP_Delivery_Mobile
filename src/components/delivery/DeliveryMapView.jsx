/**
 * DeliveryMapView.jsx
 *
 * Renders a Google Map showing the route from the restaurant (Pin A) to the
 * customer's delivery address (Pin B). Tapping "Navigate" opens Google Maps
 * for turn-by-turn driving directions.
 *
 * Props:
 *   customerLat    {number}  — latitude from order.latitude
 *   customerLng    {number}  — longitude from order.longitude
 *   deliveryAddress {string} — human-readable address (shown as fallback label)
 *
 * Restaurant coordinates are hardcoded for now.
 * TODO: fetch from branch API once the backend exposes branch coordinates.
 */

import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native'
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps'
import { Ionicons } from '@expo/vector-icons'
import { getDirections } from '../../utils/directions'
import { colors } from '../../theme/colors'

// ── Hardcoded restaurant location (branch) ────────────────────────────────────
// TODO: replace with data from the branch API.
const RESTAURANT = {
  lat: 6.9271,
  lng: 79.8612,
  label: 'CraveHouse Restaurant',
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DeliveryMapView({ customerLat, customerLng, deliveryAddress }) {
  const mapRef = useRef(null)

  const [routeCoords, setRouteCoords] = useState([])
  const [durationText, setDurationText] = useState(null)
  const [distanceText, setDistanceText] = useState(null)
  const [loadingRoute, setLoadingRoute] = useState(false)

  const hasCoordinates = customerLat != null && customerLng != null

  // ── Region that fits both markers with padding ─────────────────────────────
  const initialRegion = hasCoordinates
    ? {
        latitude: (RESTAURANT.lat + customerLat) / 2,
        longitude: (RESTAURANT.lng + customerLng) / 2,
        // Span covers both points plus ~30% padding
        latitudeDelta: Math.abs(RESTAURANT.lat - customerLat) * 1.6 + 0.01,
        longitudeDelta: Math.abs(RESTAURANT.lng - customerLng) * 1.6 + 0.01,
      }
    : {
        latitude: RESTAURANT.lat,
        longitude: RESTAURANT.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }

  // ── Fetch route on mount ───────────────────────────────────────────────────
  useEffect(() => {
    if (!hasCoordinates) return

    const fetchRoute = async () => {
      setLoadingRoute(true)
      const result = await getDirections(
        { lat: RESTAURANT.lat, lng: RESTAURANT.lng },
        { lat: customerLat, lng: customerLng }
      )
      setRouteCoords(result.polylineCoords)
      setDurationText(result.durationText)
      setDistanceText(result.distanceText)
      setLoadingRoute(false)
    }

    fetchRoute()
  }, [customerLat, customerLng])

  // ── Open Google Maps app for turn-by-turn navigation ──────────────────────
  const handleNavigate = () => {
    if (!hasCoordinates) {
      Alert.alert('No Coordinates', 'This order does not have delivery coordinates saved.')
      return
    }

    const url = `https://www.google.com/maps/dir/?api=1` +
      `&origin=${RESTAURANT.lat},${RESTAURANT.lng}` +
      `&destination=${customerLat},${customerLng}` +
      `&travelmode=driving`

    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Unable to open Google Maps')
    )
  }

  // ── No coordinates fallback ────────────────────────────────────────────────
  if (!hasCoordinates) {
    return (
      <View style={styles.noCoordContainer}>
        <Ionicons name="map-outline" size={32} color={colors.gray[300]} />
        <Text style={styles.noCoordTitle}>Map Unavailable</Text>
        <Text style={styles.noCoordSub}>
          No GPS coordinates for this order.{'\n'}
          {deliveryAddress ?? 'No address provided.'}
        </Text>
      </View>
    )
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <View style={styles.card}>
      {/* Map */}
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
        >
          {/* Pin A — Restaurant */}
          <Marker
            coordinate={{ latitude: RESTAURANT.lat, longitude: RESTAURANT.lng }}
            title="Restaurant"
            description={RESTAURANT.label}
            pinColor={colors.brand[500]}
          />

          {/* Pin B — Customer */}
          <Marker
            coordinate={{ latitude: customerLat, longitude: customerLng }}
            title="Deliver Here"
            description={deliveryAddress ?? ''}
            pinColor={colors.blue[500]}
          />

          {/* Route polyline */}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor={colors.blue[500]}
              strokeWidth={4}
            />
          )}
        </MapView>

        {/* Loading overlay */}
        {loadingRoute && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.blue[500]} />
            <Text style={styles.loadingText}>Loading route...</Text>
          </View>
        )}
      </View>

      {/* Footer: ETA + Navigate button */}
      <View style={styles.footer}>
        <View>
          {durationText ? (
            <>
              <Text style={styles.etaLabel}>ETA</Text>
              <Text style={styles.etaValue}>
                {durationText}
                {distanceText ? `  ·  ${distanceText}` : ''}
              </Text>
            </>
          ) : (
            <Text style={styles.etaLabel}>Route loaded</Text>
          )}
        </View>

        <TouchableOpacity style={styles.navigateBtn} onPress={handleNavigate} activeOpacity={0.85}>
          <Ionicons name="navigate" size={18} color={colors.white} style={{ marginRight: 6 }} />
          <Text style={styles.navigateBtnText}>Navigate</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowOffset: { height: 2 },
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  mapWrapper: {
    height: 220,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loadingText: {
    fontSize: 12,
    color: colors.gray[500],
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  etaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  etaValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.gray[900],
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue[500],
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  navigateBtnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  noCoordContainer: {
    height: 140,
    backgroundColor: colors.gray[50],
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 6,
  },
  noCoordTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray[400],
  },
  noCoordSub: {
    fontSize: 12,
    color: colors.gray[300],
    textAlign: 'center',
    paddingHorizontal: 24,
  },
})
