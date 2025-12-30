export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white px-4 py-6">
      <div className="max-w-md mx-auto space-y-4">

        {/* Header */}
        <header>
          <h1 className="text-2xl font-semibold">
            Weather
          </h1>
          <p className="text-slate-400 text-sm">
            Jakarta, Indonesia
          </p>
        </header>

        {/* Weather Card */}
        <section className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-5xl font-bold">28°</p>
              <p className="text-slate-300">Cloudy</p>
            </div>
            <div className="text-6xl">
              ☁️
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-slate-400">Wind</p>
              <p className="font-medium">12 km/h</p>
            </div>
            <div>
              <p className="text-slate-400">Humidity</p>
              <p className="font-medium">78%</p>
            </div>
            <div>
              <p className="text-slate-400">AQI</p>
              <p className="font-medium">42</p>
            </div>
          </div>
        </section>

        {/* Forecast Placeholder */}
        <section className="rounded-2xl bg-white/5 p-4 text-slate-400 text-sm">
          Forecast coming soon...
        </section>

      </div>
    </main>
  );
}
