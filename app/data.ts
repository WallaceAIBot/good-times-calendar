export type ScheduleType =
  | "recurring"
  | "one_off"
  | "seasonal"
  | "schedule_driven";

export type SeedEvent = {
  id: number;
  category: string;
  title: string;
  details: string;
  saved: boolean;
  calendar: boolean;
  badge?: string;
  icon?: string;
  featured?: boolean;
  month: number;
  day: number;
  weekday: string;
  scheduleType: ScheduleType;
  sourceType: "mock" | "scraped" | "api" | "manual";
  sourceName: string;
  sourceUrl?: string;
  lastUpdated: string;
};

export type SeedFoodDeal = {
  id: number;
  category: string;
  title: string;
  details: string;
  calendar: boolean;
  featured?: boolean;
  icon?: string;
  days: string[];
  isHappyHour: boolean;
  scheduleType: "recurring";
  sourceType: "mock" | "scraped" | "api" | "manual";
  sourceName: string;
  sourceUrl?: string;
  lastUpdated: string;
};

export type SeedBirthday = {
  id: number;
  name: string;
  date: string;
  month: number;
  day: number;
  year: number;
  icon?: string;
  personEmoji: string;
};

export const seedEvents: SeedEvent[] = [
  {
    id: 1,
    category: "Trivia",
    title: "Trivia Night @ Local Bar",
    details: "Wednesday · 7 PM · 5 miles away",
    saved: false,
    calendar: false,
    badge: "Local",
    icon: "🧠",
    featured: true,
    month: 4,
    day: 22,
    weekday: "Wed",
    scheduleType: "recurring",
    sourceType: "mock",
    sourceName: "Seed Events",
    sourceUrl: "",
    lastUpdated: "2026-04-22",
  },
  {
    id: 2,
    category: "Live Music",
    title: "Outdoor Concert Series",
    details: "Friday · 6 PM · 12 miles away",
    saved: false,
    calendar: false,
    badge: "Regional",
    icon: "🎵",
    featured: true,
    month: 4,
    day: 24,
    weekday: "Fri",
    scheduleType: "seasonal",
    sourceType: "mock",
    sourceName: "Seed Events",
    sourceUrl: "",
    lastUpdated: "2026-04-22",
  },
  {
    id: 3,
    category: "Community",
    title: "Spring Festival",
    details: "Saturday · All Day · 8 miles away",
    saved: false,
    calendar: false,
    badge: "Local",
    icon: "🎪",
    featured: true,
    month: 4,
    day: 25,
    weekday: "Sat",
    scheduleType: "one_off",
    sourceType: "mock",
    sourceName: "Seed Events",
    sourceUrl: "",
    lastUpdated: "2026-04-22",
  },
  {
    id: 4,
    category: "Food",
    title: "Food Truck Rally",
    details: "Saturday · 1 PM · 14 miles away",
    saved: false,
    calendar: false,
    badge: "Regional",
    icon: "🍔",
    featured: false,
    month: 4,
    day: 25,
    weekday: "Sat",
    scheduleType: "one_off",
    sourceType: "mock",
    sourceName: "Seed Events",
    sourceUrl: "",
    lastUpdated: "2026-04-22",
  },
  {
    id: 5,
    category: "Sports",
    title: "Kane County Cougars Game",
    details: "Sunday · 2 PM · 11 miles away",
    saved: false,
    calendar: false,
    badge: "Local",
    icon: "⚾",
    featured: false,
    month: 4,
    day: 26,
    weekday: "Sun",
    scheduleType: "schedule_driven",
    sourceType: "mock",
    sourceName: "Seed Events",
    sourceUrl: "",
    lastUpdated: "2026-04-22",
  },
  {
    id: 6,
    category: "Comedy",
    title: "Stand-Up Night at the Taproom",
    details: "Saturday · 8 PM · 18 miles away",
    saved: false,
    calendar: false,
    badge: "Local",
    icon: "🎤",
    featured: false,
    month: 4,
    day: 25,
    weekday: "Sat",
    scheduleType: "recurring",
    sourceType: "mock",
    sourceName: "Seed Events",
    sourceUrl: "",
    lastUpdated: "2026-04-22",
  },
];

export const seedFoodDeals: SeedFoodDeal[] = [
  {
    id: 101,
    category: "Monday Special",
    title: "St. Charles Place",
    details: "Half-price burgers",
    calendar: false,
    featured: true,
    icon: "🍔",
    days: ["Mon"],
    isHappyHour: false,
    scheduleType: "recurring",
    sourceType: "mock",
    sourceName: "Seed Food Deals",
    sourceUrl: "",
    lastUpdated: "2026-04-22",
  },
  {
    id: 102,
    category: "Pizza Night",
    title: "Gia Mia",
    details: "Half-price pizzas",
    calendar: false,
    featured: false,
    icon: "🍕",
    days: ["Mon"],
    isHappyHour: false,
    scheduleType: "recurring",
    sourceType: "mock",
    sourceName: "Seed Food Deals",
    sourceUrl: "",
    lastUpdated: "2026-04-22",
  },
  {
    id: 103,
    category: "Happy Hour",
    title: "Moto Imoto",
    details: "3–6 PM happy hour",
    calendar: false,
    featured: false,
    icon: "🍣",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    isHappyHour: true,
    scheduleType: "recurring",
    sourceType: "mock",
    sourceName: "Seed Food Deals",
    sourceUrl: "",
    lastUpdated: "2026-04-22",
  },
];

export const seedBirthdays: SeedBirthday[] = [
  {
    id: 201,
    name: "Mom",
    date: "April 14",
    month: 4,
    day: 14,
    year: 1962,
    icon: "🎂",
    personEmoji: "👩",
  },
  {
    id: 202,
    name: "Butters",
    date: "June 2",
    month: 6,
    day: 2,
    year: 2020,
    icon: "🎂",
    personEmoji: "🐱",
  },
];