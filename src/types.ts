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

export interface IPointInformation {
  booking: string[]
  highlights: string[]
  weather: string[]
  links: ILink[]
}

export type PlaceCategory =
  | 'attraction'
  | 'lodging'
  | 'transport'
  | 'restaurant'
  | 'market'

export interface IRestaurantSuggestion {
  name: string
  nameEn: string | null
  lat: number | null
  lng: number | null
  rating: number | null
  ratingCount: number | null
  ratingSource: string | null
  ratingCheckedAt: string | null
  distance: string | null
  priceLevel: string | null
  cuisine: string | null
  recommended: string
  hours: string | null
  sourceUrl: string | null
}

export interface IPlaceFood {
  summary: string
  restaurants: IRestaurantSuggestion[]
}

export type ParkingFee = 'free' | 'paid' | 'mixed' | 'unknown'

export interface IParkingLot {
  name: string
  nameEn: string | null
  lat: number | null
  lng: number | null
  fee: ParkingFee
  feeNote: string | null
  capacity: string | null
  surface: string | null
  note: string | null
}

export interface IPlaceParking {
  summary: string
  lots: IParkingLot[]
  rules: string[]
  sources: ILink[]
}

export interface IPlaceWeatherDetail {
  temperatureRange: string | null
  granularity: 'place' | 'nearby' | 'regional'
  basis: string
  note: string
  dayAdvisory: string
  source: string
}

export interface IPlace {
  id: string
  name: string
  name_en: string | null
  category?: PlaceCategory
  weatherDetail?: IPlaceWeatherDetail | null
  food?: IPlaceFood
  parking?: IPlaceParking
  day: number | null
  date: string | null
  status: 'visit' | 'skip'
  priority: PlacePriority
  order_in_day: number | null
  sequence: number | null
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
  dayInfo?: IPointInformation
}

export interface IRhythmNode {
  id: string
  order: number
  time: string
  title: string
  text: string
  placeId: string | null
  sequence: number | null
  priority: PlacePriority | null
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
  unassigned: IPointInformation
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

export type PlaceTextCategory = '看点' | '实用' | '天气' | '文化'

export type PlaceDetailCategory = PlaceTextCategory | '美食'

export interface IPlaceDetailSection {
  category: PlaceTextCategory
  items: string[]
}

export interface IWeatherReference {
  placeId: string
  kind: 'climate-reference'
  granularity: 'place' | 'nearby' | 'regional'
  temperatureRange: string | null
  precipitation: null
  humidity: null
  uvIndex: null
  sunshine: null
  basis: string
  note: string
  dayAdvisory: string
  summary: string
  forecastStatus: 'outside-forecast-window'
  updatedAt: string
}

export interface IJournalPhoto {
  id: string
  blob: Blob
  name: string
  type: string
}

export interface IJournalEntry {
  id: string
  placeId: string
  day: number
  date: string
  text: string
  photoIds: string[]
  createdAt: string
  updatedAt: string
}

export interface IJournalEntryWithPhotos extends IJournalEntry {
  photos: IJournalPhoto[]
}
