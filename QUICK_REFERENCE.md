# Geolocation Quick Reference

## 🚀 Quick Start

### 1. Use the Hook
```javascript
import useGeolocation from '@/hooks/useGeolocation'

const { location, error, loading, getLocation } = useGeolocation()
```

### 2. Add UI Component
```jsx
import { MapPin, Loader2 } from 'lucide-react'

<div className="rounded-lg border p-4 bg-muted/50">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <MapPin className={`h-5 w-5 ${location ? 'text-emerald-600' : 'text-muted-foreground'}`} />
      <div>
        <p className="font-medium text-sm">
          {location ? 'Location Captured' : 'Location Not Set'}
        </p>
        {location && (
          <p className="text-xs text-muted-foreground">
            Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
            {location.accuracy && ` (±${Math.round(location.accuracy)}m)`}
          </p>
        )}
      </div>
    </div>
    <button onClick={getLocation} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Location'}
    </button>
  </div>
</div>
```

### 3. Send to API
```javascript
const formData = {
  // ... your other data
  latitude: location?.latitude,
  longitude: location?.longitude,
  locationAccuracy: location?.accuracy
}
```

## 📍 Display Location

### Simple Display
```jsx
import LocationMap from '@/components/LocationMap'

<LocationMap
  latitude={product.latitude}
  longitude={product.longitude}
  accuracy={product.locationAccuracy}
  label="Registration Location"
/>
```

### Inline Display
```jsx
{event.latitude && event.longitude && (
  <p className="text-sm text-muted-foreground">
    📍 {event.latitude.toFixed(6)}, {event.longitude.toFixed(6)}
    {event.locationAccuracy && ` (±${Math.round(event.locationAccuracy)}m)`}
  </p>
)}
```

## 🔧 Common Patterns

### Auto-fetch on Mount
```javascript
const { location } = useGeolocation(true)
```

### Manual Trigger with Error Handling
```javascript
const handleGetLocation = async () => {
  try {
    const loc = await getLocation()
    console.log('Location:', loc)
  } catch (err) {
    console.error('Failed to get location:', err)
  }
}
```

### Conditional Form Submission
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // Get location first
  let geoData = location
  if (!geoData) {
    try {
      geoData = await getLocation()
    } catch (err) {
      // Continue without location
    }
  }
  
  // Submit with location
  await submitForm({
    ...formData,
    latitude: geoData?.latitude,
    longitude: geoData?.longitude
  })
}
```

## 🎨 Styling Examples

### Status Indicator
```jsx
<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
  location 
    ? 'bg-emerald-100 text-emerald-800' 
    : 'bg-gray-100 text-gray-800'
}`}>
  {location ? '📍 Located' : '📍 Not Set'}
</span>
```

### Error Display
```jsx
{error && (
  <div className="rounded-lg bg-red-50 border border-red-200 p-3">
    <p className="text-sm text-red-800">{error}</p>
  </div>
)}
```

## 🗄️ Database Queries

### Create with Location
```javascript
await prisma.product.create({
  data: {
    // ... other fields
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    locationAccuracy: data.locationAccuracy || null
  }
})
```

### Query with Location
```javascript
const products = await prisma.product.findMany({
  where: {
    latitude: { not: null },
    longitude: { not: null }
  }
})
```

### Filter by Geographic Area (example)
```javascript
const nearbyProducts = await prisma.product.findMany({
  where: {
    latitude: {
      gte: centerLat - radius,
      lte: centerLat + radius
    },
    longitude: {
      gte: centerLng - radius,
      lte: centerLng + radius
    }
  }
})
```

## 🔗 Useful Links

### Google Maps URL
```javascript
const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
```

### Google Maps Embed (future)
```html
<iframe
  width="600"
  height="450"
  frameborder="0"
  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${lat},${lng}`}
></iframe>
```

## 📊 Location Data Structure

### From Hook
```javascript
{
  latitude: 23.810300,
  longitude: 90.412500,
  accuracy: 10.5,
  altitude: null,
  altitudeAccuracy: null,
  heading: null,
  speed: null,
  timestamp: "2025-10-27T10:30:00.000Z"
}
```

### In Database
```javascript
{
  latitude: 23.810300,        // Float
  longitude: 90.412500,       // Float
  locationAccuracy: 10.5      // Float
}
```

## ⚡ Performance Tips

1. **Don't Request Repeatedly**: Cache location for current session
2. **High Accuracy**: Set `enableHighAccuracy: true` for GPS
3. **Timeout**: Keep at 10 seconds for UX
4. **No Cache**: Set `maximumAge: 0` for fresh location
5. **Optional**: Always make location optional in forms

## 🔒 Security Checklist

- [ ] HTTPS in production
- [ ] User permission flow clear
- [ ] Error messages user-friendly
- [ ] Location optional (not required)
- [ ] Privacy policy updated
- [ ] Data retention policy defined

## 🐛 Debug Commands

### Check Permission Status
```javascript
navigator.permissions.query({ name: 'geolocation' })
  .then(result => console.log('Permission:', result.state))
```

### Test Location
```javascript
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    pos => console.log('Success:', pos.coords),
    err => console.error('Error:', err.message)
  )
} else {
  console.error('Geolocation not supported')
}
```

### Check HTTPS
```javascript
console.log('Protocol:', window.location.protocol)
// Should be 'https:' in production
```

## 📱 Mobile Testing

### Test on Device
1. Enable location services
2. Grant browser permission
3. Test outdoor (GPS)
4. Test indoor (WiFi)
5. Test airplane mode

### Accuracy Expectations
- Outdoor: 5-10m
- Indoor: 20-100m
- WiFi only: 50-500m

## 🎯 Common Use Cases

### Product Origin Verification
```javascript
// Compare product origin location with event locations
const isNearOrigin = calculateDistance(
  product.latitude,
  product.longitude,
  event.latitude,
  event.longitude
) < 100 // meters
```

### Route Tracking
```javascript
// Get all locations in supply chain
const route = events
  .filter(e => e.latitude && e.longitude)
  .map(e => ({ lat: e.latitude, lng: e.longitude }))
```

### Geographic Analytics
```javascript
// Count products by region
const byRegion = products.reduce((acc, p) => {
  const region = getRegion(p.latitude, p.longitude)
  acc[region] = (acc[region] || 0) + 1
  return acc
}, {})
```

---

**Last Updated:** October 27, 2025  
**Quick Reference Version:** 1.0.0
