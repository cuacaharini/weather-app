import { redis } from "./redis"
import { weatherCodeMap } from "./weatherCodes"

const API_KEY = process.env.TOMORROW_API_KEY!

/* ======================================================
   UTIL: HITUNG START JAM BERIKUTNYA (WIB)
====================================================== */
function getNextHourWIB(): Date {
  const now = new Date()

  // UTC → WIB
  now.setHours(now.getHours() + 7)

  // set ke awal jam berikutnya
  now.setMinutes(0, 0, 0)
  now.setHours(now.getHours() + 1)

  return now
}

/* ======================================================
   CURRENT WEATHER (REDIS FIRST)
====================================================== */
export async function getCurrentWeather(city: string) {
  const cacheKey = `weather:${city.toLowerCase()}`

  // 1️⃣ REDIS FIRST
  const cached = await redis.get(cacheKey)
  if (cached) {
    return cached
  }

  // 2️⃣ FETCH TOMORROW.IO
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

/* ======================================================
   FORECAST (REDIS FIRST + TIME SAFE)
====================================================== */
export async function getForecast(city: string) {
  // ⏱️ cache bucket per 30 menit
  const nowUTC = new Date()
  const bucket = `${nowUTC.getUTCHours()}-${Math.floor(
    nowUTC.getUTCMinutes() / 30
  )}`

  const cacheKey = `forecast:${city.toLowerCase()}:${bucket}`

  // 1️⃣ REDIS FIRST
  const cached = await redis.get(cacheKey)
  if (cached) {
    return cached
  }

  // 2️⃣ FETCH TOMORROW.IO
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

  /* ======================
     HOURLY (NEXT HOURS – WIB SAFE)
  ====================== */
  const startHourWIB = getNextHourWIB()

  const hourly = data.timelines.hourly
    .filter((h: any) => {
      const forecast = new Date(h.time)
      forecast.setHours(forecast.getHours() + 7) // UTC → WIB
      return forecast >= startHourWIB
    })
    .slice(0, 8)
    .map((h: any) => {
      const info =
        weatherCodeMap[h.values.weatherCode] ??
        { label: "Cloudy", icon: "☁️" }

      return {
        time: h.time, // tetap UTC, konversi di UI
        temperature: Math.round(h.values.temperature),
        condition: info.label,
        icon: info.icon,
      }
    })

  /* ======================
     DAILY (H+1 → H+3, WIB SAFE)
  ====================== */
  const todayWIB = new Date()
  todayWIB.setHours(todayWIB.getHours() + 7)
  todayWIB.setHours(0, 0, 0, 0)

  const daily = data.timelines.daily
    .filter((d: any) => {
      const date = new Date(d.time)
      date.setHours(date.getHours() + 7)
      return date > todayWIB
    })
    .slice(0, 3)
    .map((d: any) => {
      let condition = "Cloudy"
      const rain = Number(d.values.rainIntensity ?? 0)

      if (rain > 2) condition = "Heavy Rain"
      else if (rain > 0.5) condition = "Rain"
      else if (rain > 0) condition = "Drizzle"

      return {
        date: d.time, // tetap UTC
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
