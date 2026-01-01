import { redis } from "./redis"
import { weatherCodeMap } from "./weatherCodes"

const API_KEY = process.env.TOMORROW_API_KEY!

/* =========================
   CURRENT WEATHER (REDIS FIRST)
========================= */
export async function getCurrentWeather(city: string) {
  const cacheKey = `weather:${city.toLowerCase()}`

  // 1️⃣ REDIS FIRST
  const cached = await redis.get(cacheKey)
  if (cached) {
    return cached
  }

  // 2️⃣ FETCH API
  const url = `https://api.tomorrow.io/v4/weather/realtime
    ?location=${encodeURIComponent(city)}
    &fields=temperature,weatherCode,windSpeed,humidity,rainIntensity
    &units=metric
    &apikey=${API_KEY}
  `.replace(/\s+/g, "")

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    console.warn("Realtime API limited")
    return null
  }

  const data = await res.json()
  const values = data?.data?.values
  if (!values) return null

  const code = values.weatherCode
  const weatherInfo =
    weatherCodeMap[code] ?? { label: "Cloudy", icon: "☁️" }

  const result = {
    temperature: Math.round(values.temperature),
    condition: weatherInfo.label,
    icon: weatherInfo.icon,
    wind: Math.round(values.windSpeed),
    humidity: Math.round(values.humidity),
    rainIntensity: Number(values.rainIntensity ?? 0),
    observedAt: data.data.time,
  }

  // 3️⃣ SAVE REDIS (10 MENIT)
  await redis.set(cacheKey, result, { ex: 600 })

  return result
}

/* =========================
   FORECAST (REDIS FIRST + TIME BUCKET)
========================= */
export async function getForecast(city: string) {
  const now = new Date()
  const bucket = `${now.getUTCHours()}-${Math.floor(
    now.getUTCMinutes() / 30
  )}`

  const cacheKey = `forecast:${city.toLowerCase()}:${bucket}`

  // 1️⃣ REDIS FIRST
  const cached = await redis.get(cacheKey)
  if (cached) {
    return cached
  }

  // 2️⃣ FETCH API
  const url = `https://api.tomorrow.io/v4/weather/forecast
    ?location=${encodeURIComponent(city)}
    &timesteps=hourly,daily
    &fields=temperature,temperatureMin,temperatureMax,rainIntensity,weatherCode
    &units=metric
    &apikey=${API_KEY}
  `.replace(/\s+/g, "")

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    console.warn("Forecast API limited")
    return { hourly: [], daily: [] }
  }

  const data = await res.json()

  // HOURLY (future only)
  const hourly = data.timelines.hourly
    .filter((h: any) => new Date(h.time).getTime() > Date.now())
    .slice(0, 8)
    .map((h: any) => {
      const info =
        weatherCodeMap[h.values.weatherCode] ??
        { label: "Cloudy", icon: "☁️" }

      return {
        time: h.time,
        temperature: Math.round(h.values.temperature),
        condition: info.label,
        icon: info.icon,
      }
    })

  // DAILY (H+1 → H+3)
  const daily = data.timelines.daily
    .slice(1, 4)
    .map((d: any) => {
      let condition = "Cloudy"
      const rain = Number(d.values.rainIntensity ?? 0)

      if (rain > 2) condition = "Heavy Rain"
      else if (rain > 0.5) condition = "Rain"
      else if (rain > 0) condition = "Drizzle"

      return {
        date: d.time,
        minTemp: Math.round(d.values.temperatureMin),
        maxTemp: Math.round(d.values.temperatureMax),
        condition,
      }
    })

  const result = { hourly, daily }

  // 3️⃣ SAVE REDIS (30 MENIT)
  await redis.set(cacheKey, result, { ex: 1800 })

  return result
}
