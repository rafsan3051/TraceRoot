# Geolocation UI Examples

## 1. Product Registration Page

### Location Status - Not Set
```
┌────────────────────────────────────────────────────┐
│  📍 Location Not Set                    [Get Location] │
│  Click "Get Location" to capture current position    │
└────────────────────────────────────────────────────┘
```

### Location Status - Loading
```
┌────────────────────────────────────────────────────┐
│  📍 Getting Location...                 [⟳ Getting...] │
│  Please wait while we retrieve your location        │
└────────────────────────────────────────────────────┘
```

### Location Status - Captured
```
┌────────────────────────────────────────────────────┐
│  📍 Location Captured                      [Refresh] │
│  Lat: 23.810300, Lng: 90.412500 (±10m)            │
└────────────────────────────────────────────────────┘
```

### Location Status - Error
```
┌────────────────────────────────────────────────────┐
│  📍 Location Not Set                    [Get Location] │
│  ⚠️ Location access denied. Please enable location │
│     permissions in your browser settings.          │
└────────────────────────────────────────────────────┘
```

## 2. Product Detail Page

### Registration Location Section
```
┌────────────────────────────────────────────────────┐
│  📍 Registration Location                          │
│                                                    │
│  Latitude:        23.810300                       │
│  Longitude:       90.412500                       │
│  Accuracy:        ±10 meters                      │
│                                                    │
│  [🧭 View on Google Maps]                         │
└────────────────────────────────────────────────────┘
```

### Supply Chain History with Location
```
┌────────────────────────────────────────────────────┐
│  DELIVERED                    Oct 27, 2025 10:30 AM │
│  Location: Distribution Center, Dhaka              │
│  📍 23.780500, 90.425800 (±15m)                    │
│  TX: 0x1234...5678                                 │
└────────────────────────────────────────────────────┘
```

## 3. Update Product Status Page

### Location Capture Before Event
```
┌─────────────────────────────────────────────────────┐
│  Update Product Status                              │
├─────────────────────────────────────────────────────┤
│  📦 Organic Rice                                    │
│  Origin: Dhaka, Bangladesh                          │
├─────────────────────────────────────────────────────┤
│  Location Status                                    │
│  📍 Location Captured                    [Refresh]  │
│  Lat: 23.780500, Lng: 90.425800 (±15m)            │
├─────────────────────────────────────────────────────┤
│  Event Type:  [Delivered ▼]                        │
│  Location:    [Distribution Center, Dhaka]         │
│                                                     │
│  [Update Status]  [Cancel]                         │
└─────────────────────────────────────────────────────┘
```

## 4. Permission Flow

### Step 1: User Clicks "Get Location"
```
┌────────────────────────────────────────────────────┐
│  📍 Location Not Set                    [Get Location] │
│                                        ↑ User clicks  │
└────────────────────────────────────────────────────┘
```

### Step 2: Browser Permission Prompt
```
┌────────────────────────────────────────────────────┐
│  🔒 localhost wants to know your location          │
│                                                    │
│  TraceRoot needs your location to record where    │
│  this product was registered.                     │
│                                                    │
│                    [Block]     [Allow]            │
└────────────────────────────────────────────────────┘
```

### Step 3: Location Captured
```
┌────────────────────────────────────────────────────┐
│  ✅ Location Captured                      [Refresh] │
│  Lat: 23.810300, Lng: 90.412500 (±10m)            │
└────────────────────────────────────────────────────┘
```

## 5. Google Maps Integration

When user clicks "View on Google Maps":
```
Opens: https://www.google.com/maps?q=23.810300,90.412500

Shows:
- Pin at exact coordinates
- Street view (if available)
- Nearby landmarks
- Directions option
```

## 6. Mobile View

### Compact Location Display
```
┌──────────────────────────┐
│  📍 Location Captured    │
│  23.810300, 90.412500   │
│  ±10m                   │
│  [🧭 View on Maps]      │
└──────────────────────────┘
```

## 7. Error States

### Permission Denied
```
┌────────────────────────────────────────────────────┐
│  📍 Location Not Set                    [Get Location] │
│  ❌ Location access denied. Please enable location │
│     permissions in your browser settings.          │
└────────────────────────────────────────────────────┘
```

### Position Unavailable
```
┌────────────────────────────────────────────────────┐
│  📍 Location Not Set                    [Get Location] │
│  ⚠️ Location information unavailable. Please check │
│     your device settings.                          │
└────────────────────────────────────────────────────┘
```

### Timeout
```
┌────────────────────────────────────────────────────┐
│  📍 Location Not Set                    [Get Location] │
│  ⏱️ Location request timed out. Please try again.  │
└────────────────────────────────────────────────────┘
```

### Not Supported
```
┌────────────────────────────────────────────────────┐
│  📍 Location Not Set                              │
│  ⚠️ Geolocation is not supported by your browser. │
│     Please use a modern browser.                  │
└────────────────────────────────────────────────────┘
```

## 8. Blockchain Record Example

```json
{
  "type": "PRODUCT_CREATION",
  "data": {
    "name": "Organic Rice",
    "origin": "Dhaka, Bangladesh",
    "manufactureDate": "2025-10-27",
    "latitude": 23.810300,
    "longitude": 90.412500,
    "locationAccuracy": 10.5
  },
  "timestamp": "2025-10-27T10:30:00.000Z",
  "txId": "0x1234567890abcdef..."
}
```

## 9. Database Record Example

### Product
```sql
INSERT INTO products (
  id, name, origin, manufacture_date,
  latitude, longitude, location_accuracy,
  farmer_id, blockchain_tx_id
) VALUES (
  'uuid-here',
  'Organic Rice',
  'Dhaka, Bangladesh',
  '2025-10-27',
  23.810300,
  90.412500,
  10.5,
  'farmer-uuid',
  '0x1234...'
);
```

### Supply Chain Event
```sql
INSERT INTO supply_chain_events (
  id, product_id, event_type, location,
  latitude, longitude, location_accuracy,
  user_id, blockchain_tx_id
) VALUES (
  'event-uuid',
  'product-uuid',
  'DELIVERED',
  'Distribution Center, Dhaka',
  23.780500,
  90.425800,
  15.2,
  'user-uuid',
  '0x5678...'
);
```

## 10. Visual States

### Icon States
```
📍 Gray  = Location not set
📍 Green = Location captured
⚠️ Red   = Error occurred
⟳      = Loading/refreshing
🧭      = View on maps action
```

### Button States
```
[Get Location]     = Default, ready to capture
[⟳ Getting...]     = Loading state, disabled
[Refresh]          = Location captured, can refresh
```

## 11. Accessibility

### Screen Reader Announcements
```
"Location not set. Button: Get Location"
"Getting location, please wait"
"Location captured: Latitude 23.810300, Longitude 90.412500, Accuracy plus or minus 10 meters"
"Error: Location access denied"
```

### Keyboard Navigation
```
Tab       → Focus "Get Location" button
Enter     → Trigger location capture
Tab       → Focus next form field
```

## 12. Responsive Breakpoints

### Desktop (> 768px)
- Full coordinate display
- Inline layout
- All information visible

### Mobile (< 768px)
- Stacked layout
- Abbreviated coordinates
- Compact buttons

---

These UI examples show the complete user experience for the geolocation feature across all pages and states.
