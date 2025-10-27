# Geolocation Feature Documentation

## Overview

The TraceRoot application now includes automatic geolocation capture using the Browser Geolocation API. This feature captures the precise location where products are registered and where supply chain events occur, providing enhanced traceability and verification.

## Features

### 1. **Browser Geolocation API Integration**
- ✅ Uses device GPS when available (mobile devices)
- ✅ Falls back to Wi-Fi/cell tower triangulation indoors
- ✅ Typical accuracy: meters (GPS) to tens/hundreds of meters (Wi-Fi)
- ✅ Requires explicit user permission
- ✅ High accuracy mode enabled by default

### 2. **Automatic Location Capture**

#### Product Registration
When a farmer registers a new product, the system automatically:
- Requests location permission from the user's browser
- Captures GPS coordinates (latitude, longitude)
- Records location accuracy
- Stores data in the database and blockchain

#### Supply Chain Events
When updating product status (shipped, delivered, processed), the system captures:
- Current GPS location of the event
- Timestamp of the event
- User who performed the action
- Location accuracy metrics

### 3. **User Interface Components**

#### Location Status Indicator
Shows real-time location capture status with:
- Visual indicator (green when captured, gray when not set)
- Coordinates display with 6 decimal precision
- Accuracy in meters
- Manual refresh button
- Error messages for permission issues

#### Location Map Display
Product detail pages show:
- Registration location with map link
- Event locations in supply chain history
- Clickable links to Google Maps
- Coordinates with accuracy information

## Implementation Details

### Database Schema

```prisma
model Product {
  // ... existing fields
  latitude         Float?   // Latitude where product was registered
  longitude        Float?   // Longitude where product was registered
  locationAccuracy Float?   // Accuracy in meters
}

model SupplyChainEvent {
  // ... existing fields
  latitude         Float?   // Latitude where event occurred
  longitude        Float?   // Longitude where event occurred
  locationAccuracy Float?   // Accuracy in meters
  userId           String?  // User who created this event
}
```

### Custom Hook: `useGeolocation`

**Location:** `hooks/useGeolocation.js`

**Usage:**
```javascript
import useGeolocation from '@/hooks/useGeolocation'

function MyComponent() {
  const { location, error, loading, getLocation } = useGeolocation()
  
  // Manually get location
  const handleGetLocation = async () => {
    try {
      const loc = await getLocation()
      console.log(loc.latitude, loc.longitude)
    } catch (err) {
      console.error(err)
    }
  }
  
  return (
    <button onClick={handleGetLocation}>
      {loading ? 'Getting location...' : 'Get Location'}
    </button>
  )
}
```

**Auto-fetch on mount:**
```javascript
const { location } = useGeolocation(true) // Auto-fetch
```

**Returned Data:**
```javascript
{
  location: {
    latitude: 23.8103,
    longitude: 90.4125,
    accuracy: 10.5,        // meters
    altitude: 10,          // meters (if available)
    altitudeAccuracy: 5,   // meters (if available)
    heading: 45,           // degrees (if moving)
    speed: 0,              // m/s (if moving)
    timestamp: "2025-10-27T10:30:00.000Z"
  },
  error: null,
  loading: false,
  getLocation: Function
}
```

### API Endpoints

#### POST `/api/product`
Create a new product with location data.

**Request Body:**
```json
{
  "name": "Organic Rice",
  "origin": "Dhaka, Bangladesh",
  "manufactureDate": "2025-10-27",
  "latitude": 23.8103,
  "longitude": 90.4125,
  "locationAccuracy": 10.5
}
```

#### POST `/api/update`
Create a supply chain event with location data.

**Request Body:**
```json
{
  "productId": "uuid-here",
  "eventType": "DELIVERED",
  "location": "Distribution Center, Dhaka",
  "latitude": 23.7805,
  "longitude": 90.4258,
  "locationAccuracy": 15.2
}
```

### Components

#### `LocationMap` Component
**Location:** `components/LocationMap.jsx`

**Usage:**
```jsx
import LocationMap from '@/components/LocationMap'

<LocationMap
  latitude={23.8103}
  longitude={90.4125}
  accuracy={10.5}
  label="Registration Location"
/>
```

**Props:**
- `latitude` (number, required): Latitude coordinate
- `longitude` (number, required): Longitude coordinate
- `accuracy` (number, optional): Location accuracy in meters
- `label` (string, optional): Display label (default: "Location")

## User Experience

### Permission Flow

1. User opens product registration or update page
2. UI shows "Location Not Set" with "Get Location" button
3. User clicks "Get Location" (or system auto-requests)
4. Browser prompts for location permission
5. If granted: Location captured and displayed
6. If denied: Error message shown, process continues without location

### Error Handling

The system gracefully handles:
- ❌ **Permission Denied**: Shows error message, continues without location
- ❌ **Position Unavailable**: Shows error, continues without location
- ❌ **Timeout**: Shows error, continues without location
- ❌ **Geolocation Not Supported**: Shows error, continues without location

**Location is optional** - the system works with or without it.

## Privacy & Security

### User Privacy
- ✅ Location permission required for each session
- ✅ Clear indication when location is being captured
- ✅ Users can deny location access
- ✅ Location data only captured during registration/updates
- ✅ No continuous tracking

### Data Storage
- Location data stored in database
- Coordinates included in blockchain records
- Visible only to authenticated users
- Displayed on product detail pages

## Testing

### Manual Testing Steps

1. **Product Registration:**
   - Navigate to `/register`
   - Click "Get Location" button
   - Grant location permission
   - Verify coordinates appear
   - Submit form
   - Check product detail page for location

2. **Supply Chain Event:**
   - Navigate to `/update`
   - Search for a product
   - Click "Get Location"
   - Update status
   - Verify location on product page

3. **Error Scenarios:**
   - Deny location permission → Should continue
   - Block location in browser settings → Should show error
   - Offline mode → Should timeout gracefully

### Browser Compatibility

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome  | ✅ GPS/WiFi | ✅ GPS |
| Firefox | ✅ GPS/WiFi | ✅ GPS |
| Safari  | ✅ GPS/WiFi | ✅ GPS |
| Edge    | ✅ GPS/WiFi | ✅ GPS |

## Production Considerations

### HTTPS Requirement
⚠️ **Geolocation API requires HTTPS in production**
- Works on `localhost` for development
- Must deploy on HTTPS in production
- Browsers block geolocation on HTTP sites

### Performance
- Location request timeout: 10 seconds
- High accuracy mode enabled (uses GPS)
- No caching (maximumAge: 0)
- Async operation doesn't block UI

### Accuracy Expectations

| Environment | Expected Accuracy |
|-------------|------------------|
| Outdoor (GPS) | 5-10 meters |
| Indoor (WiFi) | 20-100 meters |
| Cell Tower Only | 100-500 meters |

## Future Enhancements

Potential improvements:
1. **Interactive Maps**: Embed Google Maps/OpenStreetMap
2. **Route Visualization**: Show product journey on map
3. **Geofencing**: Validate locations against expected regions
4. **Reverse Geocoding**: Convert coordinates to addresses
5. **Location History**: Track product movement timeline
6. **Offline Support**: Cache location for offline submissions

## Troubleshooting

### Location Not Working?

1. **Check Browser Permissions:**
   - Chrome: Settings → Privacy → Site Settings → Location
   - Firefox: Preferences → Privacy → Permissions → Location
   - Safari: Preferences → Websites → Location

2. **Check HTTPS:**
   - Development: Use `localhost` (geolocation works)
   - Production: Must use HTTPS

3. **Check Network:**
   - WiFi positioning requires internet connection
   - GPS works offline on mobile devices

4. **Check Console:**
   - Open browser DevTools
   - Look for geolocation errors
   - Check permission status

### Common Errors

```
"Location access denied"
→ User denied permission or browser blocked

"Location information unavailable"
→ Device cannot determine location (check GPS/WiFi)

"Location request timed out"
→ Taking too long to get GPS fix (retry)

"Geolocation is not supported"
→ Old browser or insecure context (HTTP)
```

## API Reference

### Geolocation Hook API

```javascript
const {
  location,      // Object | null - Location data
  error,         // string | null - Error message
  loading,       // boolean - Loading state
  getLocation    // () => Promise<Location> - Manual trigger
} = useGeolocation(autoFetch: boolean = false)
```

### Location Object Structure

```typescript
interface Location {
  latitude: number          // Decimal degrees
  longitude: number         // Decimal degrees
  accuracy: number          // Meters
  altitude?: number | null  // Meters above sea level
  altitudeAccuracy?: number | null  // Meters
  heading?: number | null   // Degrees (0-360)
  speed?: number | null     // Meters/second
  timestamp: string         // ISO 8601 format
}
```

## Support

For issues or questions about the geolocation feature:
1. Check this documentation
2. Review browser console for errors
3. Verify HTTPS requirement
4. Check browser compatibility
5. Test with different devices/locations

---

**Last Updated:** October 27, 2025  
**Version:** 1.0.0  
**Feature:** Browser Geolocation Integration
