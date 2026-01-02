/**
 * Official Tomorrow.io Weather Code Mapping
 * Source: https://docs.tomorrow.io/reference/data-layers-weather-codes
 */

export const weatherCodeMap: Record<
  number,
  { label: string; icon: string }
> = {
  // Clear / Cloudy
  1000: { label: "Clear", icon: "Sun" },
  1001: { label: "Cloudy", icon: "Cloud" },

  1100: { label: "Mostly Clear", icon: "Cloud" },
  1101: { label: "Partly Cloudy", icon: "Cloud" },
  1102: { label: "Mostly Cloudy", icon: "Cloud" },

  // Fog
  2000: { label: "Fog", icon: "CloudFog" },
  2100: { label: "Light Fog", icon: "CloudFog" },

  // Drizzle & Rain
  4000: { label: "Drizzle", icon: "CloudDrizzle" },
  4001: { label: "Rain", icon: "CloudRain" },

  4200: { label: "Light Rain", icon: "CloudRain" },
  4201: { label: "Heavy Rain", icon: "CloudRain" },

  // Snow
  5000: { label: "Snow", icon: "CloudSnow" },
  5100: { label: "Light Snow", icon: "CloudSnow" },
  5101: { label: "Heavy Snow", icon: "CloudSnow" },

  // Freezing Rain
  6000: { label: "Freezing Drizzle", icon: "CloudDrizzle" },
  6001: { label: "Freezing Rain", icon: "CloudRain" },

  6200: { label: "Light Freezing Rain", icon: "CloudRain" },
  6201: { label: "Heavy Freezing Rain", icon: "CloudRain" },

  // Ice Pellets
  7000: { label: "Ice Pellets", icon: "CloudSnow" },
  7101: { label: "Heavy Ice Pellets", icon: "CloudSnow" },
  7102: { label: "Light Ice Pellets", icon: "CloudSnow" },

  // Thunderstorm
  8000: { label: "Thunderstorm", icon: "CloudLightning" },
}
