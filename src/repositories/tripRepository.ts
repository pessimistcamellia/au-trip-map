import rawTripData from '../data/trip-data.json'
import type { IPlace, ITripData, ITripDay } from '../types'

export interface ITripRepository {
  getTrip(): Promise<ITripData>
  getDay(day: number): Promise<ITripDay | null>
  getPlace(placeId: string): Promise<IPlace | null>
}

export const staticTripData = rawTripData as ITripData

export class StaticTripRepository implements ITripRepository {
  constructor(private readonly data = staticTripData) {}

  async getTrip(): Promise<ITripData> {
    return this.data
  }

  async getDay(day: number): Promise<ITripDay | null> {
    return this.data.days.find((item) => item.day === day) ?? null
  }

  async getPlace(placeId: string): Promise<IPlace | null> {
    return this.data.places.find((item) => item.id === placeId) ?? null
  }
}

export const tripRepository: ITripRepository = new StaticTripRepository()
