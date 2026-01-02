import WeatherCard from "@/components/WeatherCard"
import CitySearch from "@/components/CitySearch"
import HourlyForecast from "@/components/HourlyForecast"
import DailyForecast from "@/components/DailyForecast"
import {
  getCurrentWeather,
  getForecast,
  type CurrentWeather,
  type ForecastData,
} from "@/lib/weather"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

type PageProps = {
  searchParams?: Promise<{
    city?: string
  }>
}

export default async function Home({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {}
  const city = params.city || "Jakarta"

  let weather: CurrentWeather | null = null
  let forecast: ForecastData | null = null

  try {
    weather = await getCurrentWeather(city)
    forecast = await getForecast(city)
  } catch (err) {
    console.error(err)
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white px-4 py-6">
      <div className="max-w-md mx-auto space-y-4">

        <header>
          <h1 className="text-2xl font-semibold">Weather</h1>
          <p className="text-slate-400 text-sm">{city}</p>
        </header>

        <CitySearch />

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

        {forecast && (
          <>
            <HourlyForecast hours={forecast.hourly} />
            <DailyForecast days={forecast.daily} />
          </>
        )}
      </div>
    </main>
  )
}
