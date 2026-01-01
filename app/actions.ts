"use server"

import { getCurrentWeather } from "@/lib/weather"

export async function fetchWeatherByCity(city: string) {
  if (!city || city.trim().length < 2) {
    throw new Error("Invalid city")
  }

  return getCurrentWeather(city.trim())
}
