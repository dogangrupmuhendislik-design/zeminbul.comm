import { useState, useCallback } from 'react';

interface GeolocationState {
  loading: boolean;
  error: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    location: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation is not supported by your browser.' }));
      return;
    }

    setState({ loading: true, error: null, location: null });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          error: null,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        let errorMessage = 'An unknown error occurred.';
        switch(error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "Konum iznini reddettiniz.";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Konum bilgisi mevcut değil.";
                break;
            case error.TIMEOUT:
                errorMessage = "Konum bilgisi alma isteği zaman aşımına uğradı.";
                break;
        }
        setState({
          loading: false,
          error: errorMessage,
          location: null,
        });
      }
    );
  }, []);

  return { ...state, requestLocation };
};
