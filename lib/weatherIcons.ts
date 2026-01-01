import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
} from "lucide-react"

export const weatherIconMap: Record<string, any> = {
  Clear: Sun,
  "Mostly Clear": Sun,
  "Partly Cloudy": Cloud,
  "Mostly Cloudy": Cloud,
  Cloudy: Cloud,
  Drizzle: CloudDrizzle,
  "Light Rain": CloudRain,
  Rain: CloudRain,
  "Heavy Rain": CloudRain,
  Thunderstorm: CloudLightning,
  Snow: CloudSnow,
}
