import { Loader } from "@googlemaps/js-api-loader";

let mapsLoaderPromise = null;

/**
 * Load the Google Maps JS API once and reuse across map components.
 * @param {string} apiKey
 */
export function loadGoogleMaps(apiKey) {
  if (!mapsLoaderPromise) {
    const loader = new Loader({
      apiKey,
      version: "weekly",
    });
    mapsLoaderPromise = loader.importLibrary("maps");
  }
  return mapsLoaderPromise;
}

export function resetGoogleMapsLoader() {
  mapsLoaderPromise = null;
}

/**
 * Remove a specific overlay map type from a map instance.
 */
export function clearOverlayMapType(map, layerRef) {
  if (!map || !layerRef?.current) return;
  const overlays = map.overlayMapTypes;
  for (let i = overlays.getLength() - 1; i >= 0; i -= 1) {
    if (overlays.getAt(i) === layerRef.current) {
      overlays.removeAt(i);
    }
  }
  layerRef.current = null;
}
