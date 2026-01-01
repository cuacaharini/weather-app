"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { cities } from "@/lib/cities"

export default function CitySearch() {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const suggestions = useMemo(() => {
    if (!query) return []
    return cities.filter((c) =>
      c.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  function selectCity(city: string) {
    setQuery("")
    setOpen(false)
    router.push(`/?city=${encodeURIComponent(city)}`)
    localStorage.setItem("lastCity", city)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query) return
    selectCity(query)
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          placeholder="Search city"
          className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm outline-none
                     placeholder:text-slate-400 placeholder:italic"
        />
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-xl bg-slate-800 border border-white/10 shadow-lg overflow-hidden">
          {suggestions.map((city) => (
            <li
              key={city}
              onClick={() => selectCity(city)}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-white/10"
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
