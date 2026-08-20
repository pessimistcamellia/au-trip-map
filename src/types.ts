export type PlacePriority = 'main' | 'optional' | 'skip'

export interface ILink {
  label: string
  url: string
}

export interface IPlaceSections {
  practical?: string
  nature?: string
  culture?: string
  suggestion?: string
}

export interface IPlace {
  id: string
  name: string
  name_en: string | null
  day: number | null
  date: string | null
  status: 'visit' | 'skip'
  priority: PlacePriority
  order_in_day: number | null
  highlights: string
  weather: string
  duration: string
  transport: string
  notes: string
  lat: number | null
  lng: number | null
  geocode_source: string | null
  sections: IPlaceSections
  links: ILink[]
}

export interface IRhythmNode {
  id: string
  order: number
  time: string
  title: string
  text: string
  placeId: string | null
  lat: number | null
  lng: number | null
}

export interface ITripDay {
  day: number
  date: string
  weekday: string
  region: string
  route: string
  lodging: string
  schedule: string
  highlights: string
  booking: string
  weather: string
  links: ILink[]
  rhythm: IRhythmNode[]
}

export interface ITripData {
  trip: {
    name: string
    dates: string
    source_doc: string
    notes: string
    startDate: string
    endDate: string
    timezone: string
    myMapsUrl: string
    sourceRevision: number
  }
  days: ITripDay[]
  places: IPlace[]
  wishlistCount: number
  carStayStandard: string
  animals: string
  pending: string[]
}

export type MainView = 'today' | 'itinerary' | 'search' | 'prepare'
