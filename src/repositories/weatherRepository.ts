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
    // 逐点气候由数据增强阶段拆好；没有拆到的点才回落到日级原文。
    const detail = place.weatherDetail ?? null
    const summary = detail?.note || place.dayInfo?.weather.join('\n') || place.weather
    return {
      placeId: place.id,
      kind: 'climate-reference',
      granularity: detail?.granularity ?? 'regional',
      temperatureRange: detail?.temperatureRange ?? extractTemperatureRange(summary),
      precipitation: null,
      humidity: null,
      uvIndex: null,
      sunshine: null,
      basis: detail?.basis ?? '',
      note: detail?.note ?? '',
      dayAdvisory: detail?.dayAdvisory ?? '',
      summary,
      forecastStatus: 'outside-forecast-window',
      updatedAt: '2026-08-22',
    }
  }
}

export const weatherRepository: IWeatherRepository = new StaticWeatherRepository()
