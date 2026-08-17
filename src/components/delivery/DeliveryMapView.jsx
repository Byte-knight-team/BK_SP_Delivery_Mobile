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
import { fonts } from '../../theme/fonts'

// ── Default hardcoded restaurant location fallback ────────────────────────────
const DEFAULT_RESTAURANT = {
  lat: 6.9271,
  lng: 79.8612,
  label: 'CraveHouse Restaurant',
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DeliveryMapView({
  customerLat,
  customerLng,
  deliveryAddress,
  branchLat,
  branchLng,
  branchName,
  isRedispatch,
}) {
  const mapRef = useRef(null)

  const [routeCoords, setRouteCoords] = useState([])
  const [durationText, setDurationText] = useState(null)
  const [distanceText, setDistanceText] = useState(null)
  const [loadingRoute, setLoadingRoute] = useState(false)

  const hasCoordinates = customerLat != null && customerLng != null

  const pickupLat = branchLat || DEFAULT_RESTAURANT.lat
  const pickupLng = branchLng || DEFAULT_RESTAURANT.lng
  const pickupName = branchName || DEFAULT_RESTAURANT.label

  // ── Region that fits both markers with padding ─────────────────────────────
  const initialRegion = hasCoordinates
    ? {
        latitude: (pickupLat + customerLat) / 2,
        longitude: (pickupLng + customerLng) / 2,
        // Span covers both points plus ~30% padding
        latitudeDelta: Math.abs(pickupLat - customerLat) * 1.6 + 0.01,
        longitudeDelta: Math.abs(pickupLng - customerLng) * 1.6 + 0.01,
      }
    : {
        latitude: pickupLat,
        longitude: pickupLng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }

  // ── Fetch route on mount ───────────────────────────────────────────────────
  useEffect(() => {
    if (!hasCoordinates) return

    const fetchRoute = async () => {
      setLoadingRoute(true)
      const result = await getDirections(
        { lat: pickupLat, lng: pickupLng },
        { lat: customerLat, lng: customerLng }
      )
      setRouteCoords(result.polylineCoords)
      setDurationText(result.durationText)
      setDistanceText(result.distanceText)
      setLoadingRoute(false)
    }

    fetchRoute()
  }, [customerLat, customerLng, pickupLat, pickupLng])

  // ── Open Google Maps app for turn-by-turn navigation ──────────────────────
  const handleNavigate = () => {
    if (!hasCoordinates) {
      Alert.alert('No Coordinates', 'This order does not have delivery coordinates saved.')
      return
    }

    // No &origin= param → Google Maps uses the device's live GPS location,
    // which allows the "Start" button for turn-by-turn navigation to work.
    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${customerLat},${customerLng}` +
      `&travelmode=driving`

    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open Google Maps'))
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
          onMapReady={() => console.log('[MapView] onMapReady fired ✓')}
          onError={(e) => console.error('[MapView] onError:', e.nativeEvent)}
        >
          {/* Pin A — Restaurant (Only show if re-dispatch) */}
          {isRedispatch && (
            <Marker
              coordinate={{ latitude: pickupLat, longitude: pickupLng }}
              title="Pickup Here"
              description={pickupName}
              pinColor={colors.orange[500]}
            />
          )}

          {/* Pin B — Customer */}
          <Marker
            coordinate={{ latitude: customerLat, longitude: customerLng }}
            title="Deliver Here"
            description={deliveryAddress ?? ''}
            pinColor={colors.blue[500]}
          />

          {/* Route polyline (Only show full line if re-dispatch) */}
          {routeCoords.length > 0 && isRedispatch && (
            <Polyline
              coordinates={routeCoords}
              strokeColor={colors.blue[500]}
              strokeWidth={3}
              lineDashPattern={[10, 10]}
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
    // NOTE: overflow:'hidden' intentionally removed — it clips native MapView
    // on Android, causing a blank white surface. Border radius is applied to
    // child sections (mapWrapper top, footer bottom) instead.
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
    width: '100%',
    position: 'relative',
    // Android black screen fix: remove border radius clipping on the MapView container itself
    // and let the parent container or a wrapper handle it cleanly.
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
    fontFamily: fonts.semiBold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: colors.white,
  },
  etaLabel: {
    fontSize: 10,
    fontFamily: fonts.extraBold,
    color: colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  etaValue: {
    fontSize: 14,
    fontFamily: fonts.extraBold,
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
    fontFamily: fonts.extraBold,
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
    fontFamily: fonts.bold,
    color: colors.gray[400],
  },
  noCoordSub: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[300],
    textAlign: 'center',
    paddingHorizontal: 24,
  },
})
