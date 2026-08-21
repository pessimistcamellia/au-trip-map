import type { IPlace, IWeatherReference } from '../types'

export interface IWeatherProvider {
  getForecast(
    place: Pick<IPlace, 'id' | 'lat' | 'lng' | 'date'>,
  ): Promise<IWeatherReference | null>
}

export interface IWeatherRepository {
  getWeather(place: IPlace): Promise<IWeatherReference>
}

export class StaticClimateWeatherProvider implements IWeatherProvider {
  async getForecast(): Promise<null> {
    return null
  }
}

function extractTemperatureRange(value: string): string | null {
  return value.match(/-?\d+\s*-\s*-?\d+\s*°C/)?.[0].replace(/\s/g, '') ?? null
}

export class StaticWeatherRepository implements IWeatherRepository {
  constructor(private readonly provider: IWeatherProvider = new StaticClimateWeatherProvider()) {}

  async getWeather(place: IPlace): Promise<IWeatherReference> {
    const forecast = await this.provider.getForecast(place)
    if (forecast) return forecast
    const summary = place.dayInfo?.weather.join('\n') || place.weather
    return {
      placeId: place.id,
      kind: 'climate-reference',
      granularity: place.dayInfo?.weather.length ? 'place' : 'regional',
      temperatureRange: extractTemperatureRange(summary),
      precipitation: null,
      humidity: null,
      uvIndex: null,
      sunshine: null,
      summary,
      forecastStatus: 'outside-forecast-window',
      updatedAt: '2026-08-21',
    }
  }
}

export const weatherRepository: IWeatherRepository = new StaticWeatherRepository()
