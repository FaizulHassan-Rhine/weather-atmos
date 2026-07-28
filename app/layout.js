import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Atmos — Calm Weather Forecasts",
  description:
    "A modern weather dashboard with hourly forecasts, weekly outlooks, favorite cities, and interactive maps.",
  applicationName: "Atmos",
  keywords: ["weather", "forecast", "Atmos", "Open-Meteo", "dashboard"],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F7F8" },
    { media: "(prefers-color-scheme: dark)", color: "#0E171B" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={plusJakartaSans.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem('atmos-theme');
                  var theme = stored ? JSON.parse(stored) : null;
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches
                      ? 'dark'
                      : 'light';
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${plusJakartaSans.className} bg-atmos min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
