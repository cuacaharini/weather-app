import { weatherIconMap } from "@/lib/weatherIcons"
import { Cloud } from "lucide-react"

type DayItem = {
  date: string
  minTemp: number
  maxTemp: number
  condition: string
  icon: string
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

export default function DailyForecast({ days }: { days: DayItem[] }) {
  if (!days.length) return null

  return (
    <section className="rounded-2xl bg-white/5 p-4">
      <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3">
        Next days
      </h2>

      <div className="space-y-3">
        {days.map((d) => {
          const Icon = weatherIconMap[d.condition] ?? Cloud

          return (
            <div
              key={d.date}
              className="grid grid-cols-[100px_24px_1fr_1fr] items-center gap-3 text-sm"
            >
              {/* Date */}
              <span className="text-slate-300">
                {formatDate(d.date)}
              </span>

              {/* Icon */}
              <Icon className="w-5 h-5 text-white/80" />

              {/* ✅ CONDITION (TENGAH) */}
              <span className="text-slate-400">
                {d.condition}
              </span>

              {/* Temp */}
              <span className="text-right font-medium">
                Min {d.minTemp}° • Max {d.maxTemp}°
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
