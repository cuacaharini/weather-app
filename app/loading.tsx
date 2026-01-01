export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-900 text-white px-4 py-6 animate-pulse">
      <div className="max-w-md mx-auto space-y-4">

        {/* Header */}
        <div className="space-y-2">
          <div className="h-6 w-32 rounded bg-white/10" />
          <div className="h-4 w-24 rounded bg-white/5" />
        </div>

        {/* Search box */}
        <div className="h-10 rounded-xl bg-white/10" />

        {/* Current weather card */}
        <div className="rounded-2xl bg-white/10 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-12 w-24 rounded bg-white/20" />
              <div className="h-4 w-20 rounded bg-white/10" />
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20" />
          </div>

          <div className="h-px bg-white/10" />

          <div className="grid grid-cols-3 gap-4">
            <div className="h-4 rounded bg-white/10" />
            <div className="h-4 rounded bg-white/10" />
            <div className="h-4 rounded bg-white/10" />
          </div>
        </div>

        {/* Hourly forecast */}
        <div className="rounded-2xl bg-white/5 p-4 space-y-3">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="flex gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-24 w-20 rounded-xl bg-white/10"
              />
            ))}
          </div>
        </div>

        {/* Daily forecast */}
        <div className="rounded-2xl bg-white/5 p-4 space-y-3">
          <div className="h-4 w-24 rounded bg-white/10" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded bg-white/10"
            />
          ))}
        </div>

      </div>
    </main>
  )
}
