"use client";

import { useEffect, useMemo, useState } from "react";
import { useEvents } from "../events-context";

type ScheduleType =
  | "recurring"
  | "one_off"
  | "seasonal"
  | "schedule_driven";

type CalendarItem = {
  id: number;
  type: "event" | "foodDeal" | "birthday" | "watchlist";
  category: string;
  title: string;
  details: string;
  icon: string;
  month?: number;
  day?: number;
  personEmoji?: string;
  scheduleType?: ScheduleType | "food_recurring";
  sourceType?: string;
  sourceName?: string;
  lastUpdated?: string;
};

const weekdayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const manualEmojiOptions = ["📌", "🎂", "🍔", "🎉", "🎵", "🎤", "⚾", "❤️"];

const manualCategoryOptions = [
  "Manual",
  "Date Night",
  "Food",
  "Family",
  "Reminder",
  "Community",
  "Sports",
  "Comedy",
];

const scheduleTypeOptions: { value: ScheduleType; label: string }[] = [
  { value: "one_off", label: "One-Off" },
  { value: "recurring", label: "Recurring" },
  { value: "seasonal", label: "Seasonal" },
  { value: "schedule_driven", label: "Schedule Driven" },
];

const foodDealDayToCalendarDay: Record<string, number> = {
  Mon: 2,
  Tue: 9,
  Wed: 16,
  Thu: 23,
  Fri: 30,
  Sat: 7,
  Sun: 14,
};

function getTodayInfo() {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

function getDaysInMonth(year: number, monthNumber: number) {
  return new Date(year, monthNumber, 0).getDate();
}

function getFirstWeekdayOfMonth(year: number, monthNumber: number) {
  return new Date(year, monthNumber - 1, 1).getDay();
}

function getItemPriority(item: CalendarItem) {
  if (item.type === "birthday") return 0;
  if (item.type === "event") return 1;
  if (item.type === "foodDeal") return 2;
  if (item.type === "watchlist") return 3;
  return 4;
}

function getLifecycleInfo(item: CalendarItem, displayYear: number) {
  if (item.type === "birthday") {
    return {
      label: "Birthday",
      className: "bg-pink-100 text-pink-700",
      warning: "",
    };
  }

  if (item.type === "foodDeal" || item.scheduleType === "food_recurring") {
    return {
      label: "Weekly Recurring",
      className: "bg-blue-100 text-blue-700",
      warning: "",
    };
  }

  if (item.type === "watchlist") {
    return {
      label: "Watchlist",
      className: "bg-yellow-100 text-yellow-700",
      warning: "",
    };
  }

  if (item.scheduleType === "recurring") {
    return {
      label: "Recurring",
      className: "bg-blue-100 text-blue-700",
      warning: "",
    };
  }

  if (item.scheduleType === "seasonal") {
    return {
      label: "Seasonal",
      className: "bg-purple-100 text-purple-700",
      warning: "",
    };
  }

  if (item.scheduleType === "schedule_driven") {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const updated = item.lastUpdated
      ? new Date(`${item.lastUpdated}T00:00:00`)
      : today;
    const diffDays = Math.floor(
      (today.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 14) {
      return {
        label: "Schedule Driven",
        className: "bg-amber-100 text-amber-700",
        warning: "This may need a schedule re-check.",
      };
    }

    return {
      label: "Schedule Driven",
      className: "bg-indigo-100 text-indigo-700",
      warning: "",
    };
  }

  if (item.scheduleType === "one_off") {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDate = new Date(displayYear, (item.month ?? 1) - 1, item.day ?? 1);
    const diffDays = Math.floor(
      (today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 0) {
      return {
        label: "One-Off",
        className: "bg-red-100 text-red-700",
        warning: "This one-off event date has passed.",
      };
    }

    return {
      label: "One-Off",
      className: "bg-green-100 text-green-700",
      warning: "",
    };
  }

  return {
    label: "Event",
    className: "bg-slate-100 text-slate-700",
    warning: "",
  };
}

export default function CalendarPage() {
  const {
    events,
    foodDeals,
    birthdays,
    manualItems,
    foodDealCalendarSelections,
    filters,
    toggleFilter,
    addManualItem,
    updateManualItem,
    removeManualItem,
  } = useEvents();

  const todayInfo = useMemo(() => getTodayInfo(), []);

  const [displayYear, setDisplayYear] = useState(todayInfo.year);
  const [displayMonthNumber, setDisplayMonthNumber] = useState(todayInfo.month);
  const [selectedDay, setSelectedDay] = useState(todayInfo.day);

  const [manualInput, setManualInput] = useState("");
  const [manualEmoji, setManualEmoji] = useState("📌");
  const [manualCategory, setManualCategory] = useState("Manual");
  const [manualScheduleType, setManualScheduleType] =
    useState<ScheduleType>("one_off");

  const [editingManualId, setEditingManualId] = useState<number | null>(null);
  const [editManualText, setEditManualText] = useState("");
  const [editManualEmoji, setEditManualEmoji] = useState("📌");
  const [editManualCategory, setEditManualCategory] = useState("Manual");
  const [editManualScheduleType, setEditManualScheduleType] =
    useState<ScheduleType>("one_off");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlYear = Number(params.get("year"));
    const urlMonth = Number(params.get("month"));
    const urlDay = Number(params.get("day"));

    if (
      Number.isInteger(urlYear) &&
      Number.isInteger(urlMonth) &&
      Number.isInteger(urlDay) &&
      urlYear > 1900 &&
      urlMonth >= 1 &&
      urlMonth <= 12 &&
      urlDay >= 1 &&
      urlDay <= 31
    ) {
      setDisplayYear(urlYear);
      setDisplayMonthNumber(urlMonth);
      setSelectedDay(urlDay);
    }
  }, []);

  const currentMonthName = monthNames[displayMonthNumber - 1];
  const daysInMonth = getDaysInMonth(displayYear, displayMonthNumber);
  const firstWeekday = getFirstWeekdayOfMonth(displayYear, displayMonthNumber);

  const calendarEvents: CalendarItem[] = filters.events
    ? events
        .filter((event) => event.calendar && event.month === displayMonthNumber)
        .map((event) => ({
          id: event.id,
          type: "event",
          category: event.category,
          title: event.title,
          details: event.details,
          icon: event.icon ?? "🎉",
          month: event.month,
          day: event.day,
          scheduleType: event.scheduleType,
          sourceType: event.sourceType,
          sourceName: event.sourceName,
          lastUpdated: event.lastUpdated,
        }))
    : [];

  const calendarFoodDeals: CalendarItem[] = filters.food
    ? foodDeals
        .filter((deal) => deal.calendar)
        .map((deal) => ({
          id: deal.id,
          type: "foodDeal",
          category: deal.category,
          title: deal.title,
          details: deal.details,
          icon: deal.icon ?? "🍔",
          scheduleType: "food_recurring",
          sourceType: deal.sourceType,
          sourceName: deal.sourceName,
          lastUpdated: deal.lastUpdated,
        }))
    : [];

  const calendarHappyHourSelections: CalendarItem[] = filters.food
    ? foodDealCalendarSelections
        .map((selection) => {
          const matchingDeal = foodDeals.find(
            (deal) => deal.id === selection.dealId
          );
          if (!matchingDeal) return null;

          return {
            id: selection.id,
            type: "foodDeal" as const,
            category: `${selection.day} Happy Hour`,
            title: matchingDeal.title,
            details: matchingDeal.details,
            icon: matchingDeal.icon ?? "🍸",
            month: displayMonthNumber,
            day: foodDealDayToCalendarDay[selection.day],
            scheduleType: "food_recurring" as const,
            sourceType: matchingDeal.sourceType,
            sourceName: matchingDeal.sourceName,
            lastUpdated: matchingDeal.lastUpdated,
          };
        })
        .filter(Boolean) as CalendarItem[]
    : [];

  const birthdayItems: CalendarItem[] = filters.birthdays
    ? birthdays
        .filter((birthday) => birthday.month === displayMonthNumber)
        .map((birthday) => ({
          id: birthday.id,
          type: "birthday",
          category: "Birthday",
          title: birthday.name,
          details: `${birthday.date} · Turning ${displayYear - birthday.year}`,
          icon: birthday.icon ?? "🎂",
          month: birthday.month,
          day: birthday.day,
          personEmoji: birthday.personEmoji,
        }))
    : [];

  const watchlistItems: CalendarItem[] = filters.events
    ? events
        .filter(
          (event) =>
            event.saved &&
            !event.calendar &&
            event.month === displayMonthNumber
        )
        .map((event) => ({
          id: event.id,
          type: "watchlist",
          category: event.category,
          title: event.title,
          details: `${event.details} · Watchlist`,
          icon: event.icon ?? "⭐",
          month: event.month,
          day: event.day,
          scheduleType: event.scheduleType,
          sourceType: event.sourceType,
          sourceName: event.sourceName,
          lastUpdated: event.lastUpdated,
        }))
    : [];

  const visibleManualItems = filters.manual
    ? manualItems.filter(
        (item) => item.month === displayMonthNumber && item.day === selectedDay
      )
    : [];

  const allCalendarItems = [
    ...birthdayItems,
    ...calendarEvents,
    ...calendarFoodDeals,
    ...calendarHappyHourSelections,
  ];

  const handlePrevMonth = () => {
    if (displayMonthNumber === 1) {
      setDisplayMonthNumber(12);
      setDisplayYear((prev) => prev - 1);
    } else {
      setDisplayMonthNumber((prev) => prev - 1);
    }
    setSelectedDay(1);
    setEditingManualId(null);
  };

  const handleNextMonth = () => {
    if (displayMonthNumber === 12) {
      setDisplayMonthNumber(1);
      setDisplayYear((prev) => prev + 1);
    } else {
      setDisplayMonthNumber((prev) => prev + 1);
    }
    setSelectedDay(1);
    setEditingManualId(null);
  };

  const handleToday = () => {
    setDisplayYear(todayInfo.year);
    setDisplayMonthNumber(todayInfo.month);
    setSelectedDay(todayInfo.day);
    setEditingManualId(null);
  };

  const selectedDayEvents = useMemo(() => {
    return allCalendarItems
      .filter((item) => item.day === selectedDay)
      .sort((a, b) => {
        const priorityDiff = getItemPriority(a) - getItemPriority(b);
        if (priorityDiff !== 0) return priorityDiff;
        return a.title.localeCompare(b.title);
      });
  }, [allCalendarItems, selectedDay]);

  const selectedDayWatchlist = useMemo(() => {
    return watchlistItems
      .filter((item) => item.day === selectedDay)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [watchlistItems, selectedDay]);

  const selectedDayManualItems = useMemo(() => {
    return visibleManualItems;
  }, [visibleManualItems]);

  const daySummary = {
    calendar: selectedDayEvents.length,
    starred: selectedDayWatchlist.length,
    manual: selectedDayManualItems.length,
    total:
      selectedDayEvents.length +
      selectedDayWatchlist.length +
      selectedDayManualItems.length,
  };

  const handleAddManualItem = () => {
    addManualItem(
      displayMonthNumber,
      selectedDay,
      manualInput,
      manualEmoji,
      manualCategory,
      manualScheduleType
    );
    setManualInput("");
  };

  const startEditingManual = (
    id: number,
    text: string,
    icon: string,
    category?: string,
    scheduleType?: ScheduleType
  ) => {
    setEditingManualId(id);
    setEditManualText(text);
    setEditManualEmoji(icon);
    setEditManualCategory(category ?? "Manual");
    setEditManualScheduleType(scheduleType ?? "one_off");
  };

  const cancelEditingManual = () => {
    setEditingManualId(null);
    setEditManualText("");
    setEditManualEmoji("📌");
    setEditManualCategory("Manual");
    setEditManualScheduleType("one_off");
  };

  const saveEditingManual = () => {
    if (editingManualId === null) return;
    updateManualItem(
      editingManualId,
      editManualText,
      editManualEmoji,
      editManualCategory,
      editManualScheduleType
    );
    cancelEditingManual();
  };

  const getDayCount = (day: number) => {
    const calendarItemCount = allCalendarItems.filter(
      (item) => item.day === day
    ).length;
    const watchlistCount = watchlistItems.filter(
      (item) => item.day === day
    ).length;
    const manualCount = filters.manual
      ? manualItems.filter(
          (item) => item.month === displayMonthNumber && item.day === day
        ).length
      : 0;

    return calendarItemCount + watchlistCount + manualCount;
  };

  const getDayPreviewIcons = (day: number) => {
    const icons: string[] = [];

    const orderedCalendarItems = allCalendarItems
      .filter((item) => item.day === day)
      .sort((a, b) => {
        const priorityDiff = getItemPriority(a) - getItemPriority(b);
        if (priorityDiff !== 0) return priorityDiff;
        return a.title.localeCompare(b.title);
      });

    orderedCalendarItems.forEach((item) => {
      if (item.type === "birthday") {
        icons.push("🎂");
      } else {
        icons.push(item.icon);
      }
    });

    watchlistItems
      .filter((item) => item.day === day)
      .sort((a, b) => a.title.localeCompare(b.title))
      .forEach((item) => icons.push(item.icon));

    if (filters.manual) {
      manualItems
        .filter((item) => item.month === displayMonthNumber && item.day === day)
        .forEach((item) => icons.push(item.icon));
    }

    return icons.slice(0, 3);
  };

  const selectedWeekdayName = useMemo(() => {
    const weekdayIndex = new Date(
      displayYear,
      displayMonthNumber - 1,
      selectedDay
    ).getDay();
    return weekdayNames[weekdayIndex];
  }, [displayYear, displayMonthNumber, selectedDay]);

  const isSelectedToday =
    displayYear === todayInfo.year &&
    displayMonthNumber === todayInfo.month &&
    selectedDay === todayInfo.day;

  const calendarCells = [
    ...Array.from({ length: firstWeekday }, (_, index) => ({
      type: "blank" as const,
      key: `blank-${index}`,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      type: "day" as const,
      day: index + 1,
      key: `day-${index + 1}`,
    })),
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50 px-4 py-5 text-slate-900 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Calendar
          </h1>
          <p className="mt-1 text-sm text-slate-700 sm:text-base">
            Plan your year at a glance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-black/5 sm:px-4 sm:text-sm"
          >
            ← Prev
          </button>
          <button
            onClick={handleToday}
            className="rounded-full bg-slate-900 px-3 py-2 text-xs font-bold text-white sm:px-4 sm:text-sm"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-black/5 sm:px-4 sm:text-sm"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: "birthdays", label: "🎂 Birthdays" },
          { key: "events", label: "🎉 Events" },
          { key: "food", label: "🍔 Food" },
          { key: "manual", label: "📌 Manual" },
        ].map(({ key, label }) => {
          const isOn = filters[key as keyof typeof filters];

          return (
            <button
              key={key}
              onClick={() => toggleFilter(key as keyof typeof filters)}
              className={`rounded-full px-3 py-2 text-xs font-bold sm:text-sm ${
                isOn
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-black/10"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr] lg:gap-5">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">
              {currentMonthName} {displayYear}
            </h2>
            <p className="text-xs font-medium text-slate-500 sm:text-sm">
              Tap a day to expand it
            </p>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
            {weekdayShort.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell) => {
              if (cell.type === "blank") {
                return (
                  <div key={cell.key} className="min-h-[82px] sm:min-h-[96px]" />
                );
              }

              const day = cell.day;
              const count = getDayCount(day);
              const isSelected = selectedDay === day;
              const previewIcons = getDayPreviewIcons(day);

              return (
                <button
                  key={cell.key}
                  onClick={() => {
                    setSelectedDay(day);
                    setEditingManualId(null);
                  }}
                  className={`rounded-2xl border bg-white p-2 text-left shadow-sm transition ${
                    isSelected
                      ? "scale-[1.01] border-orange-400 bg-orange-50 ring-2 ring-orange-200"
                      : "border-black/5 hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-extrabold text-slate-900">
                      {day}
                    </span>
                    {count > 0 ? (
                      <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                        {count}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 min-h-7">
                    {count > 0 ? (
                      <>
                        <div className="flex items-center gap-1">
                          {previewIcons.map((icon, idx) => (
                            <span key={`${day}-${icon}-${idx}`} className="text-xs">
                              {icon}
                            </span>
                          ))}
                        </div>
                        <p className="mt-1 text-[10px] font-medium text-slate-600">
                          {count} item{count === 1 ? "" : "s"}
                        </p>
                      </>
                    ) : (
                      <p className="text-[10px] text-slate-300">Open</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="rounded-[1.8rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {selectedWeekdayName}, {currentMonthName} {selectedDay}
            </h2>
            {isSelectedToday ? (
              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                Today
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-slate-600">
            Your day-at-a-glance view
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-orange-50 p-3 text-center ring-1 ring-orange-100">
              <p className="text-lg font-extrabold text-orange-700">
                {daySummary.calendar}
              </p>
              <p className="text-[10px] font-bold uppercase text-orange-600">
                Scheduled
              </p>
            </div>

            <div className="rounded-2xl bg-yellow-50 p-3 text-center ring-1 ring-yellow-100">
              <p className="text-lg font-extrabold text-yellow-700">
                {daySummary.starred}
              </p>
              <p className="text-[10px] font-bold uppercase text-yellow-600">
                Starred
              </p>
            </div>

            <div className="rounded-2xl bg-pink-50 p-3 text-center ring-1 ring-pink-100">
              <p className="text-lg font-extrabold text-pink-700">
                {daySummary.manual}
              </p>
              <p className="text-[10px] font-bold uppercase text-pink-600">
                Manual
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-orange-600">
                Scheduled Items
              </h3>
              <span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-700">
                {daySummary.calendar}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {selectedDayEvents.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Nothing scheduled yet for this day.
                </div>
              ) : (
                selectedDayEvents.map((item) => {
                  const lifecycle = getLifecycleInfo(item, displayYear);

                  return (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-orange-100 bg-orange-50/50 p-4 shadow-sm"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                          {item.category}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${lifecycle.className}`}
                          >
                            {lifecycle.label}
                          </span>

                          {item.sourceType === "imported" ? (
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
                              Imported
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <h4 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                        {item.type === "birthday" ? "🎂" : item.icon} {item.title}
                        {item.type === "birthday" && item.personEmoji
                          ? ` ${item.personEmoji}`
                          : ""}
                      </h4>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {item.details}
                      </p>

                      {lifecycle.warning ? (
                        <div className="mt-2 rounded-2xl bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
                          <p className="text-xs font-semibold text-amber-700">
                            {lifecycle.warning}
                          </p>
                        </div>
                      ) : null}

                      {item.sourceName ? (
                        <div className="mt-2 rounded-2xl bg-white px-3 py-2 ring-1 ring-black/5">
                          <p className="text-[11px] text-slate-500">
                            Source:{" "}
                            <span className="font-semibold text-slate-700">
                              {item.sourceName}
                            </span>
                          </p>
                          {item.lastUpdated ? (
                            <p className="mt-1 text-[11px] text-slate-500">
                              Last reviewed/imported: {item.lastUpdated}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-yellow-600">
                Starred Ideas
              </h3>
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-bold text-yellow-700">
                {daySummary.starred}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {selectedDayWatchlist.length === 0 ? (
                <div className="rounded-2xl bg-yellow-50 p-4 text-sm text-slate-600">
                  No starred watchlist items for this day.
                </div>
              ) : (
                selectedDayWatchlist.map((item) => {
                  const lifecycle = getLifecycleInfo(item, displayYear);

                  return (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-yellow-700">
                          {item.category}
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${lifecycle.className}`}
                        >
                          {lifecycle.label}
                        </span>
                      </div>

                      <h4 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                        {item.icon} {item.title}
                      </h4>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {item.details}
                      </p>

                      {lifecycle.warning ? (
                        <div className="mt-2 rounded-2xl bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
                          <p className="text-xs font-semibold text-amber-700">
                            {lifecycle.warning}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-pink-600">
                Manual Items
              </h3>
              <span className="rounded-full bg-pink-100 px-2 py-1 text-[10px] font-bold text-pink-700">
                {daySummary.manual}
              </span>
            </div>

            <div className="mt-3 rounded-3xl bg-pink-50/60 p-3 ring-1 ring-pink-100">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-pink-600">
                Add Manual Item
              </p>

              <div className="flex flex-wrap gap-2">
                {manualEmojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setManualEmoji(emoji)}
                    className={`rounded-full px-3 py-2 text-sm transition ${
                      manualEmoji === emoji
                        ? "bg-pink-100 ring-2 ring-pink-200"
                        : "bg-white"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-300"
                >
                  {manualCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={manualScheduleType}
                  onChange={(e) =>
                    setManualScheduleType(e.target.value as ScheduleType)
                  }
                  className="rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-300"
                >
                  {scheduleTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Dinner, movie night, reminder..."
                  className="flex-1 rounded-full border border-black/10 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-300"
                />
                <button
                  onClick={handleAddManualItem}
                  className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {!filters.manual ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Manual items are hidden by the filter toggle.
                </div>
              ) : selectedDayManualItems.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  No manual items for this day yet.
                </div>
              ) : (
                selectedDayManualItems.map((item) => {
                  const isEditing = editingManualId === item.id;
                  const manualCalendarItem: CalendarItem = {
                    id: item.id,
                    type: "event",
                    category: item.category ?? "Manual",
                    title: item.text,
                    details: "Manual calendar item",
                    icon: item.icon,
                    month: item.month,
                    day: item.day,
                    scheduleType: item.scheduleType ?? "one_off",
                    sourceType: "manual",
                    sourceName: item.sourceName ?? "Manual Entry",
                    lastUpdated: item.lastUpdated,
                  };
                  const lifecycle = getLifecycleInfo(
                    manualCalendarItem,
                    displayYear
                  );

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-pink-100 bg-white p-3 shadow-sm"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {manualEmojiOptions.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => setEditManualEmoji(emoji)}
                                className={`rounded-full px-3 py-2 text-sm transition ${
                                  editManualEmoji === emoji
                                    ? "bg-pink-100 ring-2 ring-pink-200"
                                    : "bg-slate-100"
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={editManualCategory}
                              onChange={(e) =>
                                setEditManualCategory(e.target.value)
                              }
                              className="rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-300"
                            >
                              {manualCategoryOptions.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>

                            <select
                              value={editManualScheduleType}
                              onChange={(e) =>
                                setEditManualScheduleType(
                                  e.target.value as ScheduleType
                                )
                              }
                              className="rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-300"
                            >
                              {scheduleTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <input
                            value={editManualText}
                            onChange={(e) => setEditManualText(e.target.value)}
                            className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
                            placeholder="Edit item"
                          />

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={saveEditingManual}
                              className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditingManual}
                              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-purple-700">
                                {item.icon} {item.category ?? "Manual"}
                              </span>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${lifecycle.className}`}
                              >
                                {lifecycle.label}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  startEditingManual(
                                    item.id,
                                    item.text,
                                    item.icon,
                                    item.category,
                                    item.scheduleType
                                  )
                                }
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeManualItem(item.id)}
                                className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>

                          <p className="text-sm font-medium text-slate-800">
                            {item.text}
                          </p>

                          {lifecycle.warning ? (
                            <div className="rounded-2xl bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
                              <p className="text-xs font-semibold text-amber-700">
                                {lifecycle.warning}
                              </p>
                            </div>
                          ) : null}

                          <p className="text-[11px] text-slate-500">
                            Source: {item.sourceName ?? "Manual Entry"}
                            {item.lastUpdated
                              ? ` · Updated ${item.lastUpdated}`
                              : ""}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}