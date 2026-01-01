export const weatherCodeMap: Record<
  number,
  { label: string; icon: string }
> = {
  1000: { label: "Clear", icon: "☀️" },
  1100: { label: "Mostly Clear", icon: "🌤️" },
  1101: { label: "Partly Cloudy", icon: "⛅" },
  1001: { label: "Cloudy", icon: "☁️" },
  2000: { label: "Fog", icon: "🌫️" },
  4000: { label: "Drizzle", icon: "🌦️" },
  4001: { label: "Rain", icon: "🌧️" },
  4200: { label: "Light Rain", icon: "🌦️" },
  5000: { label: "Snow", icon: "❄️" },
  8000: { label: "Thunderstorm", icon: "⛈️" },
}
