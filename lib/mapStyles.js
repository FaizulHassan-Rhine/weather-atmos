/**
 * Muted Google Maps styles matching the Atmos palette.
 * Light and dark variants keep the map calm and non-distracting.
 */

export const lightMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#f4f7f8" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#718087" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f4f7f8" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#a9c6d9" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#ddede9" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#d5e3ea" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#e7b98d" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#a9c6d9" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f92b5" }],
  },
];

export const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#17242a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#a9c6d9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0e171b" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4f8f8b" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#1d2d34" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#24343c" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0e171b" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#4f8f8b" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e171b" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f92b5" }],
  },
];
