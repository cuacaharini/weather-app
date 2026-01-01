import { weatherCodeMap } from "./weatherCodes"

const API_KEY = process.env.TOMORROW_API_KEY

if (!API_KEY) {
  throw new Error("TOMORROW_API_KEY is not set")
}

/* ======================================================
   CURRENT WEATHER (REALTIME)
====================================================== */
export async function getCurrentWeather(city: string) {
  const url = `https://api.tomorrow.io/v4/weather/realtime
    ?location=${encodeURIComponent(city)}
    &fields=temperature,weatherCode,windSpeed,humidity,rainIntensity
    &units=metric
    &apikey=${API_KEY}
  `.replace(/\s+/g, "")

  const res = await fetch(url, { cache: "no-store" })

  if (!res.ok) {
    const text = await res.text()
    console.error("Realtime error body:", text)
    throw new Error("Failed to fetch current weather")
  }

  const data = await res.json()
  const values = data?.data?.values

  if (!values) {
    console.error("Invalid realtime response:", data)
    throw new Error("Realtime data malformed")
  }

  const code = values.weatherCode
  const weatherInfo =
    weatherCodeMap[code] ?? { label: "Cloudy", icon: "☁️" }

  return {
    temperature: Math.round(values.temperature),
    condition: weatherInfo.label,
    icon: weatherInfo.icon,
    wind: Math.round(values.windSpeed),
    humidity: Math.round(values.humidity),
    rainIntensity: Number(values.rainIntensity ?? 0),
    observedAt: data.data.time,
  }
}

/* ======================================================
   FORECAST (HOURLY + DAILY)
====================================================== */
export async function getForecast(city: string) {
  const url = `https://api.tomorrow.io/v4/weather/forecast
    ?location=${encodeURIComponent(city)}
    &timesteps=hourly,daily
    &fields=temperature,temperatureMin,temperatureMax,rainIntensity,weatherCode
    &units=metric
    &apikey=${API_KEY}
  `.replace(/\s+/g, "")

  const res = await fetch(url, { cache: "no-store" })
  console.log("Forecast status:", res.status)

  if (!res.ok) {
    const text = await res.text()
    console.error("Forecast error body:", text)
    throw new Error("Failed to fetch forecast")
  }

  const data = await res.json()

  /* ======================
     HOURLY FORECAST
     (8 jam ke depan)
  ====================== */
  const hourly = data.timelines.hourly
    .slice(0, 8)
    .map((h: any) => {
      const code = h.values.weatherCode
      const weatherInfo =
        weatherCodeMap[code] ?? { label: "Cloudy", icon: "☁️" }

      return {
        time: h.time,
        temperature: Math.round(h.values.temperature),
        condition: weatherInfo.label,
        icon: weatherInfo.icon,
      }
    })

  /* ======================
     DAILY FORECAST
     (H+1 s/d H+3)
     NOTE:
     - Free tier daily weatherCode sering kosong
     - Pakai rainIntensity → lebih stabil
  ====================== */
  const daily = data.timelines.daily
    .slice(1, 4) // skip hari ini, ambil 3 hari
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

  return { hourly, daily }
}
