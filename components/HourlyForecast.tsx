import { weatherIconMap } from "@/lib/weatherIcons"
import { Cloud } from "lucide-react"

type HourItem = {
  time: string
  temperature: number
  condition: string
  icon: string
}

function formatHour(time: string) {
  return new Date(time).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function HourlyForecast({ hours }: { hours: HourItem[] }) {
  if (!hours.length) return null

  return (
    <section className="rounded-2xl bg-white/5 p-4">
      <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3">
        Next hours
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {hours.map((h) => {
          const Icon = weatherIconMap[h.condition] ?? Cloud

          return (
            <div
              key={h.time}
              className="min-w-[80px] rounded-xl bg-white/10 p-3 text-center"
            >
              <p className="text-xs text-slate-300">
                {formatHour(h.time)}
              </p>

              <Icon className="mx-auto my-1 h-5 w-5 text-white/90" />

              {/* ✅ SUHU */}
              <p className="font-semibold">
                {h.temperature}°
              </p>

              {/* ✅ KONDISI */}
              <p className="text-[10px] text-slate-400">
                {h.condition}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
