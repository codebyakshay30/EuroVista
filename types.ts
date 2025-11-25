export interface WeatherData {
  temp: string;
  condition: string;
  packingSuggestion: string;
}

export interface Attraction {
  name: string;
  benefit: string;
  price: string;
}

export interface ItineraryItem {
  time: string;
  activity: string;
  description: string;
  estimatedCost: string;
}

export interface CityDetails {
  intro: string;
  weather: WeatherData;
  bestTimeToVisit: string;
  attractions: Attraction[];
  mapContext: string;
  itinerary: {
    morning: ItineraryItem;
    afternoon: ItineraryItem;
    evening: ItineraryItem;
    night: ItineraryItem;
  };
  tips: {
    travel: string;
    food: string;
    safety: string;
    culture: string;
  };
  sources?: string[];
}

export interface TripPlan {
  destination: string;
  totalCost: string;
  dailyBreakdown: ItineraryItem[];
  tips: string[];
}

export interface BudgetResult {
  totalCost: string;
  perDay: string;
  savingTips: string[];
}

export enum AppView {
  SPLASH = 'SPLASH',
  HOME = 'HOME',
  CITY_DETAIL = 'CITY_DETAIL',
  PLANNER = 'PLANNER',
  BUDGET = 'BUDGET',
  TRANSLATOR = 'TRANSLATOR',
}

export const POPULAR_CITIES = [
  { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?q=80&w=800&auto=format&fit=crop' },
  { name: 'Rome', country: 'Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop' },
  { name: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1613395877344-13d4c79e4df1?q=80&w=800&auto=format&fit=crop' },
  { name: 'Swiss Alps', country: 'Switzerland', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop' },
  { name: 'Barcelona', country: 'Spain', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=800&auto=format&fit=crop' },
  { name: 'Amsterdam', country: 'Netherlands', image: 'https://images.unsplash.com/photo-1512470876302-687da745313d?q=80&w=800&auto=format&fit=crop' },
  { name: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop' },
  { name: 'Prague', country: 'Czech Republic', image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=800&auto=format&fit=crop' },
];