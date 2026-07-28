# Atmos

A calm, premium weather dashboard built with Next.js, Tailwind CSS, Open-Meteo, and Google Maps.

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment example and add your Google Maps API key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

The app runs without a Maps key; the map section shows a helpful fallback instead.

3. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint

## Features

- City search via Open-Meteo Geocoding (multi-language labels)
- Current, hourly, and 7-day forecasts
- Temperature & precipitation charts
- Weather metrics, alerts, and “what to wear” tips
- Air quality (AQI, PM2.5, ozone)
- Moon phase with night-focused messaging
- Compare up to 3 favorite cities
- Google Maps location view with RainViewer radar overlay
- Favorites persisted in localStorage
- Celsius / Fahrenheit toggle
- Light / dark theme
- Geolocation with reverse geocoding and Dhaka fallback
- Shareable city links (`/?lat=…&lon=…&name=…`)
- Auto-refresh every 12 minutes with “Updated just now”
