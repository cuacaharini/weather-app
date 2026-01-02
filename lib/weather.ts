import { redis } from "@/lib/redis"
import { weatherCodeMap } from "@/lib/weatherCodes"

/* ======================================================
   TYPES — SINGLE SOURCE OF TRUTH
====================================================== */

export type CurrentWeather = {
  temperature: number
  condition: string
  icon: string
  wind: number
  humidity: number
  rainIntensity: number
  observedAt: string
}

export type HourlyItem = {
  time: string
  temperature: number
  condition: string
  icon: string
}

export type DailyItem = {
  date: string
  minTemp: number
  maxTemp: number
  condition: string
  icon: string
}

export type ForecastData = {
  hourly: HourlyItem[]
  daily: DailyItem[]
}

/* ======================================================
   CONFIG
====================================================== */

const API_KEY = process.env.TOMORROW_API_KEY!

/* ======================================================
   CURRENT WEATHER (REDIS → API)
====================================================== */

export async function getCurrentWeather(
  city: string
): Promise<CurrentWeather> {
  const cacheKey = `weather:current:${city.toLowerCase()}`

  const cached = await redis.get<CurrentWeather>(cacheKey)
  if (cached) return cached

  const url = `https://api.tomorrow.io/v4/weather/realtime?location=${encodeURIComponent(
    city
  )}&apikey=${API_KEY}`

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Failed to fetch current weather")
  }

  const json = await res.json()
  const values = json.data.values

  const info =
    weatherCodeMap[values.weatherCode] ??
    { label: "Cloudy", icon: "Cloud" }

  const result: CurrentWeather = {
    temperature: Math.round(values.temperature),
    condition: info.label,
    icon: info.icon,
    wind: Math.round(values.windSpeed),
    humidity: Math.round(values.humidity),
    rainIntensity: values.precipitationIntensity ?? 0,
    observedAt: json.data.time,
  }

  await redis.set(cacheKey, result, { ex: 600 })

  return result
}

/* ======================================================
   FORECAST (REDIS → API)
====================================================== */

export async function getForecast(
  city: string
): Promise<ForecastData> {
  const cacheKey = `weather:forecast:${city.toLowerCase()}`

  const cached = await redis.get<ForecastData>(cacheKey)
  if (cached) return cached

  const url = `https://api.tomorrow.io/v4/weather/forecast?location=${encodeURIComponent(
    city
  )}&apikey=${API_KEY}`

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Failed to fetch forecast")
  }

  const json = await res.json()

  /* ---------- HOURLY (next hours) ---------- */
  const hourly: HourlyItem[] = json.timelines.hourly
    .slice(1, 9)
    .map((h: any) => {
      const info =
        weatherCodeMap[h.values.weatherCode] ??
        { label: "Cloudy", icon: "Cloud" }

      return {
        time: h.time,
        temperature: Math.round(h.values.temperature),
        condition: info.label,
        icon: info.icon,
      }
    })

  /* ---------- DAILY (H+1 sampai H+3) ---------- */
  const daily: DailyItem[] = json.timelines.daily
    .slice(1, 4)
    .map((d: any) => {
      const info =
        weatherCodeMap[d.values.weatherCodeMax] ??
        { label: "Cloudy", icon: "Cloud" }

      return {
        date: d.time,
        minTemp: Math.round(d.values.temperatureMin),
        maxTemp: Math.round(d.values.temperatureMax),
        condition: info.label,
        icon: info.icon,
      }
    })

  const result: ForecastData = { hourly, daily }

  await redis.set(cacheKey, result, { ex: 1800 })

  return result
}
