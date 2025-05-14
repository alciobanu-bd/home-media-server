<template>
  <div class="geo-map-container">
    <div v-if="hasCoordinates" class="geo-map" ref="mapContainer"></div>
    <div v-if="address" class="location-address">
      {{ address }}
    </div>
    <div v-else-if="!hasCoordinates" class="no-location-data">No location data available</div>
  </div>
</template>

<script>
export default {
  name: 'GeoLocationMap',
  props: {
    gpsData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      map: null,
      marker: null,
      address: null
    };
  },
  computed: {
    hasCoordinates() {
      return this.gpsData && 
        (typeof this.gpsData.GPSLatitude !== 'undefined' && 
         typeof this.gpsData.GPSLongitude !== 'undefined') ||
        (typeof this.gpsData.latitude !== 'undefined' && 
         typeof this.gpsData.longitude !== 'undefined');
    },
    coordinates() {
      if (!this.hasCoordinates) return null;
      
      // Extract latitude and longitude from EXIF data
      // Handle different possible formats from different cameras/phones
      if (typeof this.gpsData.GPSLatitude !== 'undefined' && 
          typeof this.gpsData.GPSLongitude !== 'undefined') {
        
        const lat = this.convertToDecimalDegrees(
          this.gpsData.GPSLatitude, 
          this.gpsData.GPSLatitudeRef
        );
        
        const lng = this.convertToDecimalDegrees(
          this.gpsData.GPSLongitude, 
          this.gpsData.GPSLongitudeRef
        );
        
        return { lat, lng };
      } 
      // Handle already decimal format (some devices store this way)
      else if (typeof this.gpsData.latitude !== 'undefined' && 
               typeof this.gpsData.longitude !== 'undefined') {
        return {
          lat: this.gpsData.latitude,
          lng: this.gpsData.longitude
        };
      }
      
      return null;
    }
  },
  watch: {
    gpsData: {
      handler() {
        this.$nextTick(() => {
          if (this.hasCoordinates) {
            this.initMap();
          }
        });
      },
      immediate: true
    }
  },
  methods: {
    // Convert GPS coordinates from DMS format to decimal degrees
    convertToDecimalDegrees(coordinate, ref) {
      if (!coordinate) return null;
      
      // If coordinate is already a number, assume it's in decimal format
      if (typeof coordinate === 'number') {
        // Make it negative if South or West
        return (ref === 'S' || ref === 'W') ? -coordinate : coordinate;
      }
      
      // For coordinates stored as an array [degrees, minutes, seconds]
      if (Array.isArray(coordinate) && coordinate.length === 3) {
        const [degrees, minutes, seconds] = coordinate;
        let decimal = degrees + (minutes / 60) + (seconds / 3600);
        
        // Make it negative if South or West
        if (ref === 'S' || ref === 'W') {
          decimal = -decimal;
        }
        
        return decimal;
      }
      
      return null;
    },
    
    async initMap() {
      if (!this.hasCoordinates) return;
      
      // Wait for the leaflet script to be loaded
      if (typeof window.L === 'undefined') {
        await this.loadLeaflet();
      }
      
      const coords = this.coordinates;
      if (!coords) return;
      
      // Initialize the map if it doesn't exist
      if (!this.map) {
        const mapContainer = this.$refs.mapContainer;
        if (!mapContainer) return;
        
        this.map = window.L.map(mapContainer).setView([coords.lat, coords.lng], 13);
        
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
      } else {
        // Update view if map already exists
        this.map.setView([coords.lat, coords.lng], 13);
        
        // Remove existing marker if any
        if (this.marker) {
          this.map.removeLayer(this.marker);
        }
      }
      
      // Add marker
      this.marker = window.L.marker([coords.lat, coords.lng]).addTo(this.map);
      
      // Force map to refresh size
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 100);
      
      // Get address from coordinates using reverse geocoding
      this.reverseGeocode(coords.lat, coords.lng);
    },
    
    async reverseGeocode(lat, lng) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'Home Media Server App'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.display_name) {
            this.address = data.display_name;
          }
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        // Silently fail - the map will still be displayed without the address
      }
    },
    
    async loadLeaflet() {
      return new Promise((resolve) => {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
        
        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }
  }
};
</script>

<style scoped>
.geo-map-container {
  width: 100%;
  margin-top: 12px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.geo-map {
  height: 200px;
  width: 100%;
}

.no-location-data {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary);
  font-style: italic;
  font-size: 0.9em;
}

.location-address {
  padding: 10px;
  font-size: 0.9em;
  color: var(--color-text);
  text-align: center;
  border-top: 1px solid var(--color-border);
  background-color: rgba(0,0,0,0.03);
  word-break: break-word;
}
</style> 