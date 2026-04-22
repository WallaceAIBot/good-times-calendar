"use client";

import { useMemo, useState } from "react";
import { useEvents } from "../events-context";

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

const foodDealDayToCalendarDay: Record<string, number> = {
  Mon: 2,
  Tue: 9,
  Wed: 16,
  Thu: 23,
  Fri: 30,
  Sat: 7,
  Sun: 14,
};

const CURRENT_YEAR = 2026;
const TODAY_MONTH_NUMBER = 4;
const TODAY_DAY = 22;

const manualEmojiOptions = ["📌", "🎂", "🍔", "🎉", "🎵", "🎤", "⚾", "❤️"];

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

export default function CalendarPage() {
  const {
    events,
    foodDeals,
    birthdays,
    manualItems,
    foodDealCalendarSelections,
    addManualItem,
    removeManualItem,
  } = useEvents();

  const [displayYear, setDisplayYear] = useState(CURRENT_YEAR);
  const [displayMonthNumber, setDisplayMonthNumber] = useState(TODAY_MONTH_NUMBER);
  const [selectedDay, setSelectedDay] = useState(TODAY_DAY);
  const [manualInput, setManualInput] = useState("");
  const [manualEmoji, setManualEmoji] = useState("📌");

  const currentMonthName = monthNames[displayMonthNumber - 1];
  const daysInMonth = getDaysInMonth(displayYear, displayMonthNumber);
  const firstWeekday = getFirstWeekdayOfMonth(displayYear, displayMonthNumber);

  const calendarEvents: CalendarItem[] = events
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
    }));

  const calendarFoodDeals: CalendarItem[] = foodDeals
    .filter((deal) => deal.calendar)
    .map((deal) => ({
      id: deal.id,
      type: "foodDeal",
      category: deal.category,
      title: deal.title,
      details: deal.details,
      icon: deal.icon ?? "🍔",
    }));

  const calendarHappyHourSelections: CalendarItem[] = foodDealCalendarSelections
    .map((selection) => {
      const matchingDeal = foodDeals.find((deal) => deal.id === selection.dealId);
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
      };
    })
    .filter(Boolean) as CalendarItem[];

  const birthdayItems: CalendarItem[] = birthdays
    .filter((birthday) => birthday.month === displayMonthNumber)
    .map((birthday) => ({
      id: birthday.id,
      type: "birthday",
      category: "Birthday",
      title: birthday.name,
      details: `${birthday.date} · Turning ${CURRENT_YEAR - birthday.year}`,
      icon: birthday.icon ?? "🎂",
      month: birthday.month,
      day: birthday.day,
      personEmoji: birthday.personEmoji,
    }));

  const watchlistItems: CalendarItem[] = events
    .filter((event) => event.saved && !event.calendar && event.month === displayMonthNumber)
    .map((event) => ({
      id: event.id,
      type: "watchlist",
      category: event.category,
      title: event.title,
      details: `${event.details} · Watchlist`,
      icon: event.icon ?? "⭐",
      month: event.month,
      day: event.day,
    }));

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
  };

  const handleNextMonth = () => {
    if (displayMonthNumber === 12) {
      setDisplayMonthNumber(1);
      setDisplayYear((prev) => prev + 1);
    } else {
      setDisplayMonthNumber((prev) => prev + 1);
    }
    setSelectedDay(1);
  };

  const handleToday = () => {
    setDisplayYear(CURRENT_YEAR);
    setDisplayMonthNumber(TODAY_MONTH_NUMBER);
    setSelectedDay(TODAY_DAY);
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
    return manualItems.filter(
      (item) => item.month === displayMonthNumber && item.day === selectedDay
    );
  }, [manualItems, displayMonthNumber, selectedDay]);

  const handleAddManualItem = () => {
    addManualItem(displayMonthNumber, selectedDay, manualInput, manualEmoji);
    setManualInput("");
  };

  const getDayCount = (day: number) => {
    const calendarItemCount = allCalendarItems.filter((item) => item.day === day).length;
    const watchlistCount = watchlistItems.filter((item) => item.day === day).length;
    const manualCount = manualItems.filter(
      (item) => item.month === displayMonthNumber && item.day === day
    ).length;

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

    manualItems
      .filter((item) => item.month === displayMonthNumber && item.day === day)
      .forEach((item) => icons.push(item.icon));

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
    displayYear === CURRENT_YEAR &&
    displayMonthNumber === TODAY_MONTH_NUMBER &&
    selectedDay === TODAY_DAY;

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
                return <div key={cell.key} className="min-h-[82px] sm:min-h-[96px]" />;
              }

              const day = cell.day;
              const count = getDayCount(day);
              const isSelected = selectedDay === day;
              const previewIcons = getDayPreviewIcons(day);

              return (
                <button
                  key={cell.key}
                  onClick={() => setSelectedDay(day)}
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

          <div className="mt-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-orange-600">
              Calendar Items
            </h3>

            <div className="mt-3 space-y-3">
              {selectedDayEvents.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Nothing scheduled yet for this day.
                </div>
              ) : (
                selectedDayEvents.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-black/5 bg-slate-50 p-4 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                        {item.category}
                      </p>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          item.type === "birthday"
                            ? "bg-pink-100 text-pink-700"
                            : item.type === "event"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.type === "birthday"
                          ? `${item.personEmoji ?? "🎂"} Birthday`
                          : item.type === "event"
                          ? "🎉 Event"
                          : "🍔 Food Deal"}
                      </span>
                    </div>

                    <h4 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                      {item.type === "birthday" ? "🎂" : item.icon} {item.title}
                      {item.type === "birthday" && item.personEmoji ? ` ${item.personEmoji}` : ""}
                    </h4>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {item.details}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-yellow-600">
              Starred Ideas
            </h3>

            <div className="mt-3 space-y-3">
              {selectedDayWatchlist.length === 0 ? (
                <div className="rounded-2xl bg-yellow-50 p-4 text-sm text-slate-600">
                  No starred watchlist items for this day.
                </div>
              ) : (
                selectedDayWatchlist.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-yellow-700">
                        {item.category}
                      </p>

                      <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-yellow-700">
                        ⭐ Watchlist
                      </span>
                    </div>

                    <h4 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                      {item.icon} {item.title}
                    </h4>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {item.details}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-pink-600">
              Manual Items
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {manualEmojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setManualEmoji(emoji)}
                  className={`rounded-full px-3 py-2 text-sm transition ${
                    manualEmoji === emoji
                      ? "bg-pink-100 ring-2 ring-pink-200"
                      : "bg-slate-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
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

            <div className="mt-3 space-y-2">
              {selectedDayManualItems.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  No manual items for this day yet.
                </div>
              ) : (
                selectedDayManualItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-purple-700">
                        {item.icon} Manual
                      </span>
                      <p className="text-sm font-medium text-slate-800">{item.text}</p>
                    </div>

                    <button
                      onClick={() => removeManualItem(item.id)}
                      className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}