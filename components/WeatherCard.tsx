import { Cloud } from "lucide-react"
import { weatherIconMap } from "@/lib/weatherIcons"

type WeatherCardProps = {
  temperature: number
  condition: string
  icon: string
  wind: number
  humidity: number
  rainIntensity: number
  observedAt: string
}

function formatObservedTime(iso: string) {
  const date = new Date(iso)

  return date.toLocaleString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
    timeZoneName: "short",
  })
}


function getRainLabel(value: number) {
  if (value === 0) return "No rain"
  if (value < 2) return "Drizzle"
  if (value < 5) return "Light rain"
  if (value < 10) return "Moderate rain"
  return "Heavy rain"
}

export default function WeatherCard({
  temperature,
  condition,
  icon,
  wind,
  humidity,
  rainIntensity,
  observedAt,
}: WeatherCardProps) {
    const Icon = weatherIconMap[condition] ?? Cloud
  return (
    <section className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-5xl font-semibold">
            {Number.isFinite(temperature) ? temperature : "--"}°
          </p>
          <p className="text-slate-300 mt-1">
            {condition || "Unknown"}
          </p>

          {/* ✅ WAKTU OBSERVASI */}
          <p className="text-xs text-slate-400 mt-1">
            {formatObservedTime(observedAt)}
          </p>
        </div>

        <div>
            <Icon className="w-12 h-12 text-white/90" />
        </div>
      </div>

      <div className="my-4 h-px bg-white/10" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-slate-400">Wind</p>
          <p className="font-medium">
            {Number.isFinite(wind) ? `${wind} km/h` : "N/A"}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Humidity</p>
          <p className="font-medium">
            {Number.isFinite(humidity) ? `${humidity}%` : "N/A"}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Rain</p>
          <p className="font-medium">
            {Number.isFinite(rainIntensity)
              ? `${rainIntensity} mm/h`
              : "N/A"}
          </p>
          <p className="text-xs text-slate-400">
            {getRainLabel(rainIntensity)}
          </p>
        </div>
      </div>
    </section>
  )
}
