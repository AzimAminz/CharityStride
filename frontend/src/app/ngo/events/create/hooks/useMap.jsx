
import { useState, useRef, useEffect, useCallback } from 'react';

export const useMap = (formData, setFormData) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [mapSearch, setMapSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Initialize map dengan user's current location
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      getUserLocation();
    } else {
      loadGoogleMapsScript();
    }
  }, []);

  const loadGoogleMapsScript = () => {
    if (!document.querySelector('#google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAP_API}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        getUserLocation();
      };
      document.head.appendChild(script);
    }
  };

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      initMapWithDefaultLocation();
      return;
    }

    setIsGettingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setIsGettingLocation(false);
        initMap(userLocation);
        reverseGeocode(userLocation.lat, userLocation.lng);
      },
      (error) => {
        setIsGettingLocation(false);
        console.error("Error getting location:", error);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Using default location.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable. Using default location.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Using default location.");
            break;
          default:
            setLocationError("An unknown error occurred. Using default location.");
            break;
        }
        
        initMapWithDefaultLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  const initMapWithDefaultLocation = useCallback(() => {
    const defaultLocation = { lat: 3.1390, lng: 101.6869 };
    initMap(defaultLocation);
  }, []);

  const initMap = useCallback((initialLocation) => {
    if (!mapRef.current) return;
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: initialLocation,
      zoom: 12,
    });

    const markerInstance = new window.google.maps.Marker({
      position: initialLocation,
      map: mapInstance,
      draggable: true,
      title: "Event Location"
    });

    setFormData(prev => ({
      ...prev,
      latitude: initialLocation.lat,
      longitude: initialLocation.lng
    }));

    markerInstance.addListener('dragend', (event) => {
      const position = event.latLng;
      setFormData(prev => ({
        ...prev,
        latitude: position.lat(),
        longitude: position.lng()
      }));
      reverseGeocode(position.lat(), position.lng());
    });

    mapInstance.addListener('click', (event) => {
      markerInstance.setPosition(event.latLng);
      setFormData(prev => ({
        ...prev,
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng()
      }));
      reverseGeocode(event.latLng.lat(), event.latLng.lng());
    });

    // Initialize search box
    const searchBox = new window.google.maps.places.SearchBox(
      document.getElementById('map-search')
    );

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      const location = place.geometry.location;

      markerInstance.setPosition(location);
      mapInstance.setCenter(location);
      mapInstance.setZoom(15);

      setFormData(prev => ({
        ...prev,
        location: place.formatted_address,
        latitude: location.lat(),
        longitude: location.lng()
      }));
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  }, [setFormData]);

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setIsGettingLocation(false);
        
        if (map && marker) {
          map.setCenter(userLocation);
          map.setZoom(15);
          marker.setPosition(userLocation);
          
          setFormData(prev => ({
            ...prev,
            latitude: userLocation.lat,
            longitude: userLocation.lng
          }));
          
          reverseGeocode(userLocation.lat, userLocation.lng);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        console.error("Error getting location:", error);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enable location permissions.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Unable to retrieve your location.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("Failed to get your location. Please try again.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [map, marker, setFormData]);

  const performSearch = useCallback((query) => {
    if (!window.google || !map) return;

    setIsSearching(true);
    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      query: query,
      fields: ['name', 'geometry', 'formatted_address']
    };

    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
        const place = results[0];
        const location = place.geometry.location;

        marker.setPosition(location);
        map.setCenter(location);
        map.setZoom(15);

        setFormData(prev => ({
          ...prev,
          location: place.formatted_address,
          latitude: location.lat(),
          longitude: location.lng()
        }));
      }
      setIsSearching(false);
    });
  }, [map, marker, setFormData]);

  const handleManualSearch = useCallback(() => {
    if (mapSearch.trim()) {
      performSearch(mapSearch);
    }
  }, [mapSearch, performSearch]);

  const handleMapSearchChange = useCallback((e) => {
    const value = e.target.value;
    setMapSearch(value);
  }, []);

  const reverseGeocode = useCallback((lat, lng) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setFormData(prev => ({
          ...prev,
          location: results[0].formatted_address
        }));
      }
    });
  }, [setFormData]);

  return {
    mapRef,
    mapSearch,
    isSearching,
    isGettingLocation,
    locationError,
    handleGetCurrentLocation,
    handleManualSearch,
    handleMapSearchChange
  };
};