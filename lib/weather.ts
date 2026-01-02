import { redis } from "./redis"
import { weatherCodeMap } from "./weatherCodes"

const API_KEY = process.env.TOMORROW_API_KEY!

/* ======================================================
   CURRENT WEATHER (REDIS FIRST)
====================================================== */
export async function getCurrentWeather(city: string) {
  const cacheKey = `weather:${city.toLowerCase()}`

  // 1️⃣ Redis first
  const cached = await redis.get(cacheKey)
  if (cached) return cached

  // 2️⃣ Fetch realtime weather (UTC)
  const url = `https://api.tomorrow.io/v4/weather/realtime
    ?location=${encodeURIComponent(city)}
    &fields=temperature,weatherCode,windSpeed,humidity,rainIntensity
    &units=metric
    &apikey=${API_KEY}
  `.replace(/\s+/g, "")

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    console.warn("Realtime API error:", res.status)
    return null
  }

  const json = await res.json()
  const values = json?.data?.values
  if (!values) return null

  const info =
    weatherCodeMap[values.weatherCode] ??
    { label: "Cloudy", icon: "☁️" }

  const result = {
    temperature: Math.round(values.temperature),
    condition: info.label,
    icon: info.icon,
    wind: Math.round(values.windSpeed),
    humidity: Math.round(values.humidity),
    rainIntensity: Number(values.rainIntensity ?? 0),
    observedAt: json.data.time, // UTC
  }

  // 3️⃣ Cache 10 menit
  await redis.set(cacheKey, result, { ex: 600 })

  return result
}

/* ======================================================
   FORECAST (REDIS FIRST, UTC SAFE)
====================================================== */
export async function getForecast(city: string) {
  // bucket cache per 30 menit (hindari spam API)
  const nowUTC = new Date()
  const bucket = `${nowUTC.getUTCHours()}-${Math.floor(
    nowUTC.getUTCMinutes() / 30
  )}`

  const cacheKey = `forecast:${city.toLowerCase()}:${bucket}`

  // 1️⃣ Redis first
  const cached = await redis.get(cacheKey)
  if (cached) return cached

  // 2️⃣ Fetch forecast (UTC)
  const url = `https://api.tomorrow.io/v4/weather/forecast
    ?location=${encodeURIComponent(city)}
    &timesteps=hourly,daily
    &fields=temperature,temperatureMin,temperatureMax,rainIntensity,weatherCode
    &units=metric
    &apikey=${API_KEY}
  `.replace(/\s+/g, "")

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    console.warn("Forecast API error:", res.status)
    return { hourly: [], daily: [] }
  }

  const json = await res.json()
  const nowTimeUTC = Date.now()

  /* ======================
     HOURLY (NEXT HOURS ONLY)
     👉 STRICT UTC COMPARISON
  ====================== */
  const hourly = json.timelines.hourly
    .filter((h: any) => {
      const t = new Date(h.time).getTime()
      return t > nowTimeUTC // 🔑 INI KUNCI UTAMA
    })
    .slice(0, 8)
    .map((h: any) => {
      const info =
        weatherCodeMap[h.values.weatherCode] ??
        { label: "Cloudy", icon: "☁️" }

      return {
        time: h.time, // UTC (UI convert ke WIB)
        temperature: Math.round(h.values.temperature),
        condition: info.label,
        icon: info.icon,
      }
    })

  /* ======================
     DAILY (H+1 s/d H+3)
     👉 UTC-BASED, NO TODAY
  ====================== */
  const todayUTC = new Date()
  todayUTC.setUTCHours(0, 0, 0, 0)

  const daily = json.timelines.daily
    .filter((d: any) => {
      const t = new Date(d.time).getTime()
      return t > todayUTC.getTime()
    })
    .slice(0, 3)
    .map((d: any) => {
      let condition = "Cloudy"
      const rain = Number(d.values.rainIntensity ?? 0)

      if (rain > 2) condition = "Heavy Rain"
      else if (rain > 0.5) condition = "Rain"
      else if (rain > 0) condition = "Drizzle"

      return {
        date: d.time, // UTC
        minTemp: Math.round(d.values.temperatureMin),
        maxTemp: Math.round(d.values.temperatureMax),
        condition,
      }
    })

  const result = { hourly, daily }

  // 3️⃣ Cache forecast 30 menit
  await redis.set(cacheKey, result, { ex: 1800 })

  return result
}
