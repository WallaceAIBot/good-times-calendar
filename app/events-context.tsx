"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { events as initialEvents } from "./discover/events";

type EventItem = {
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
};

type FoodDealItem = {
  id: number;
  category: string;
  title: string;
  details: string;
  calendar: boolean;
  featured?: boolean;
  icon?: string;
  days: string[];
  isHappyHour: boolean;
};

type FoodDealCalendarSelection = {
  id: number;
  dealId: number;
  day: string;
};

type BirthdayItem = {
  id: number;
  name: string;
  date: string;
  month: number;
  day: number;
  year: number;
  icon?: string;
  personEmoji: string;
};

type ManualItem = {
  id: number;
  month: number;
  day: number;
  text: string;
  icon: string;
};

type EventsContextType = {
  events: EventItem[];
  foodDeals: FoodDealItem[];
  birthdays: BirthdayItem[];
  manualItems: ManualItem[];
  foodDealCalendarSelections: FoodDealCalendarSelection[];
  starredCount: number;
  calendarCount: number;
  foodDealsCount: number;
  birthdaysCount: number;
  featuredEvents: EventItem[];
  featuredFoodDeal: FoodDealItem | null;
  upcomingBirthdays: BirthdayItem[];
  toggleSaved: (id: number) => void;
  toggleCalendar: (id: number) => void;
  toggleFoodDealCalendar: (id: number) => void;
  toggleFoodDealDayCalendar: (dealId: number, day: string) => void;
  isFoodDealDayInCalendar: (dealId: number, day: string) => boolean;
  addBirthday: (
    name: string,
    date: string,
    month: number,
    day: number,
    year: number,
    personEmoji: string
  ) => void;
  removeBirthday: (id: number) => void;
  addManualItem: (
    month: number,
    day: number,
    text: string,
    icon: string
  ) => void;
  removeManualItem: (id: number) => void;
};

const EVENTS_KEY = "good-times-calendar-events-v3";
const FOOD_DEALS_KEY = "good-times-calendar-food-deals-v3";
const BIRTHDAYS_KEY = "good-times-calendar-birthdays-v3";
const MANUAL_ITEMS_KEY = "good-times-calendar-manual-items-v3";
const HAPPY_HOUR_KEY = "good-times-calendar-happy-hour-v3";

const seededEvents: EventItem[] = initialEvents.map((event) => ({
  ...event,
  featured: true,
}));

const initialFoodDeals: FoodDealItem[] = [
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
  },
];

const initialBirthdays: BirthdayItem[] = [
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

const EventsContext = createContext<EventsContextType | undefined>(undefined);

function readArrayFromStorage<T>(key: string): T[] | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;

    return parsed as T[];
  } catch {
    return null;
  }
}

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>(seededEvents);
  const [foodDeals, setFoodDeals] = useState<FoodDealItem[]>(initialFoodDeals);
  const [birthdays, setBirthdays] = useState<BirthdayItem[]>(initialBirthdays);
  const [manualItems, setManualItems] = useState<ManualItem[]>([]);
  const [foodDealCalendarSelections, setFoodDealCalendarSelections] = useState<
    FoodDealCalendarSelection[]
  >([]);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const storedEvents = readArrayFromStorage<EventItem>(EVENTS_KEY);
    const storedFoodDeals = readArrayFromStorage<FoodDealItem>(FOOD_DEALS_KEY);
    const storedBirthdays = readArrayFromStorage<BirthdayItem>(BIRTHDAYS_KEY);
    const storedManualItems = readArrayFromStorage<ManualItem>(MANUAL_ITEMS_KEY);
    const storedHappyHourSelections =
      readArrayFromStorage<FoodDealCalendarSelection>(HAPPY_HOUR_KEY);

    if (storedEvents) setEvents(storedEvents);
    if (storedFoodDeals) setFoodDeals(storedFoodDeals);
    if (storedBirthdays) setBirthdays(storedBirthdays);
    if (storedManualItems) setManualItems(storedManualItems);
    if (storedHappyHourSelections) {
      setFoodDealCalendarSelections(storedHappyHourSelections);
    }

    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }, [events, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(FOOD_DEALS_KEY, JSON.stringify(foodDeals));
  }, [foodDeals, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(BIRTHDAYS_KEY, JSON.stringify(birthdays));
  }, [birthdays, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(MANUAL_ITEMS_KEY, JSON.stringify(manualItems));
  }, [manualItems, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(
      HAPPY_HOUR_KEY,
      JSON.stringify(foodDealCalendarSelections)
    );
  }, [foodDealCalendarSelections, storageReady]);

  const toggleSaved = (id: number) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, saved: !event.saved } : event
      )
    );
  };

  const toggleCalendar = (id: number) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, calendar: !event.calendar } : event
      )
    );
  };

  const toggleFoodDealCalendar = (id: number) => {
    setFoodDeals((prev) =>
      prev.map((deal) =>
        deal.id === id ? { ...deal, calendar: !deal.calendar } : deal
      )
    );
  };

  const toggleFoodDealDayCalendar = (dealId: number, day: string) => {
    setFoodDealCalendarSelections((prev) => {
      const existing = prev.find(
        (selection) => selection.dealId === dealId && selection.day === day
      );

      if (existing) {
        return prev.filter((selection) => selection.id !== existing.id);
      }

      return [
        ...prev,
        {
          id: Date.now(),
          dealId,
          day,
        },
      ];
    });
  };

  const isFoodDealDayInCalendar = (dealId: number, day: string) => {
    return foodDealCalendarSelections.some(
      (selection) => selection.dealId === dealId && selection.day === day
    );
  };

  const addBirthday = (
    name: string,
    date: string,
    month: number,
    day: number,
    year: number,
    personEmoji: string
  ) => {
    setBirthdays((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        date,
        month,
        day,
        year,
        icon: "🎂",
        personEmoji,
      },
    ]);
  };

  const removeBirthday = (id: number) => {
    setBirthdays((prev) => prev.filter((birthday) => birthday.id !== id));
  };

  const addManualItem = (
    month: number,
    day: number,
    text: string,
    icon: string
  ) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setManualItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        month,
        day,
        text: trimmed,
        icon,
      },
    ]);
  };

  const removeManualItem = (id: number) => {
    setManualItems((prev) => prev.filter((item) => item.id !== id));
  };

  const starredCount = useMemo(
    () => events.filter((event) => event.saved).length,
    [events]
  );

  const calendarCount = useMemo(
    () =>
      events.filter((event) => event.calendar).length +
      foodDealCalendarSelections.length +
      foodDeals.filter((deal) => deal.calendar).length +
      birthdays.length +
      manualItems.length,
    [events, foodDealCalendarSelections, foodDeals, birthdays, manualItems]
  );

  const foodDealsCount = useMemo(() => foodDeals.length, [foodDeals]);
  const birthdaysCount = useMemo(() => birthdays.length, [birthdays]);

  const featuredEvents = useMemo(
    () => events.filter((event) => event.featured).slice(0, 3),
    [events]
  );

  const featuredFoodDeal = useMemo(
    () => foodDeals.find((deal) => deal.featured) ?? foodDeals[0] ?? null,
    [foodDeals]
  );

  const upcomingBirthdays = useMemo(() => {
    return [...birthdays]
      .sort((a, b) => a.month - b.month || a.day - b.day)
      .slice(0, 2);
  }, [birthdays]);

  return (
    <EventsContext.Provider
      value={{
        events,
        foodDeals,
        birthdays,
        manualItems,
        foodDealCalendarSelections,
        starredCount,
        calendarCount,
        foodDealsCount,
        birthdaysCount,
        featuredEvents,
        featuredFoodDeal,
        upcomingBirthdays,
        toggleSaved,
        toggleCalendar,
        toggleFoodDealCalendar,
        toggleFoodDealDayCalendar,
        isFoodDealDayInCalendar,
        addBirthday,
        removeBirthday,
        addManualItem,
        removeManualItem,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);

  if (!context) {
    throw new Error("useEvents must be used inside EventsProvider");
  }

  return context;
}