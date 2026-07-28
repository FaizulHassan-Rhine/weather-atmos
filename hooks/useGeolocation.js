"use client";

import { useCallback, useState } from "react";

export default function useGeolocation() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(null);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      setError("Geolocation is not supported by this browser.");
      return Promise.reject(new Error("unsupported"));
    }

    setStatus("loading");
    setError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const next = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCoords(next);
          setStatus("granted");
          resolve(next);
        },
        (err) => {
          let message = "Unable to access your location.";
          if (err.code === err.PERMISSION_DENIED) {
            message = "Location permission was denied.";
            setStatus("denied");
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            message = "Location information is unavailable.";
            setStatus("error");
          } else if (err.code === err.TIMEOUT) {
            message = "Location request timed out.";
            setStatus("error");
          } else {
            setStatus("error");
          }
          setError(message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  }, []);

  return {
    status,
    error,
    coords,
    requestLocation,
  };
}
