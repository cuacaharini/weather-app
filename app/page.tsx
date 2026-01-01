import WeatherCard from "@/components/WeatherCard"
import CitySearch from "@/components/CitySearch"
import HourlyForecast from "@/components/HourlyForecast"
import DailyForecast from "@/components/DailyForecast"
import { getCurrentWeather, getForecast } from "@/lib/weather"

export const dynamic = "force-dynamic"
export const revalidate = 0

function formatToday() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

type PageProps = {
  searchParams?: Promise<{
    city?: string
  }>
}

export default async function Home({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {}
  const city = params.city || "Jakarta"

  // 🔒 SAFE FETCH (REDIS-FIRST DI BACKEND)
  const weather = await getCurrentWeather(city)
  const forecast = await getForecast(city)

  return (
    <main className="min-h-screen bg-slate-900 text-white px-4 py-6">
      <div className="max-w-md mx-auto space-y-4">

        <header>
          <h1 className="text-2xl font-semibold">Weather</h1>
          <p className="text-slate-400 text-sm">
            {city}
          </p>
        </header>

        <CitySearch />

        <p className="text-xs text-slate-400">
          {formatToday()}
        </p>

        {/* ✅ CURRENT WEATHER (GUARDED) */}
        {weather && (
          <WeatherCard
            temperature={weather.temperature}
            condition={weather.condition}
            icon={weather.icon}
            wind={weather.wind}
            humidity={weather.humidity}
            rainIntensity={weather.rainIntensity}
            observedAt={weather.observedAt}
          />
        )}

        {/* ✅ FORECAST (GUARDED) */}
        <HourlyForecast hours={forecast?.hourly ?? []} />
        <DailyForecast days={forecast?.daily ?? []} />

      </div>
    </main>
  )
}
