import { redis } from "@/lib/redis"
import { weatherCodeMap } from "./weatherCodes"

const API_KEY = process.env.TOMORROW_API_KEY!

/* ======================
   TYPES
====================== */
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
  min: number
  max: number
  condition: string
  icon: string
}

export type ForecastData = {
  hourly: HourlyItem[]
  daily: DailyItem[]
}

/* ======================
   CURRENT WEATHER
====================== */
export async function getCurrentWeather(
  city: string
): Promise<CurrentWeather> {
  const cacheKey = `current:${city.toLowerCase()}`

  const cached = await redis.get<CurrentWeather>(cacheKey)
  if (cached) return cached

  const url = `https://api.tomorrow.io/v4/weather/realtime?location=${encodeURIComponent(
    city
  )}&apikey=${API_KEY}`

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch current weather")

  const json = await res.json()
  const values = json.data.values

  const code = values.weatherCode
  const info = weatherCodeMap[code] ?? {
    label: "Unknown",
    icon: "Cloud",
  }

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

/* ======================
   FORECAST
====================== */
export async function getForecast(
  city: string
): Promise<ForecastData> {
  const cacheKey = `forecast:${city.toLowerCase()}`
  const cached = await redis.get<ForecastData>(cacheKey)
  if (cached) return cached

  const url = `https://api.tomorrow.io/v4/weather/forecast?location=${encodeURIComponent(
    city
  )}&apikey=${API_KEY}`

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch forecast")

  const json = await res.json()

  const hourly: HourlyItem[] =
    json.timelines.hourly.slice(1, 9).map((h: any) => {
      const info =
        weatherCodeMap[h.values.weatherCode] ??
        { label: "Unknown", icon: "Cloud" }

      return {
        time: h.time,
        temperature: Math.round(h.values.temperature),
        condition: info.label,
        icon: info.icon,
      }
    })

  const daily: DailyItem[] =
    json.timelines.daily.slice(1, 4).map((d: any) => {
      const info =
        weatherCodeMap[d.values.weatherCodeMax] ??
        { label: "Unknown", icon: "Cloud" }

      return {
        date: d.time,
        min: Math.round(d.values.temperatureMin),
        max: Math.round(d.values.temperatureMax),
        condition: info.label,
        icon: info.icon,
      }
    })

  const result: ForecastData = { hourly, daily }
  await redis.set(cacheKey, result, { ex: 1800 })

  return result
}
