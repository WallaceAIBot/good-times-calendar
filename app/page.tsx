"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useEvents } from "./events-context";

const weekdayShortNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const weekdayLongNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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

type DashboardItem = {
  title: string;
  details: string;
  icon: string;
  type: "birthday" | "event" | "food" | "manual";
  category?: string;
  sortDate?: Date;
  isPreferenceMatch?: boolean;
  matchReason?: string;
  scheduleType?: string;
  sourceType?: string;
  sourceName?: string;
  lastUpdated?: string;
};

function getNextOccurrence(month: number, day: number, now: Date) {
  const currentYear = now.getFullYear();
  const thisYearDate = new Date(currentYear, month - 1, day);

  if (thisYearDate >= new Date(currentYear, now.getMonth(), now.getDate())) {
    return thisYearDate;
  }

  return new Date(currentYear + 1, month - 1, day);
}

function formatMonthDay(date: Date) {
  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
}

function getDayBadgeLabel(date: Date, today: Date) {
  const diffMs =
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
    new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return weekdayLongNames[date.getDay()];
}

function getFoodTypeFromDeal(title: string, details: string) {
  const combined = `${title} ${details}`.toLowerCase();

  if (combined.includes("pizza")) return "Pizza";
  if (combined.includes("burger")) return "Burgers";
  if (
    combined.includes("taco") ||
    combined.includes("mex") ||
    combined.includes("burrito")
  ) {
    return "Mexican";
  }
  if (
    combined.includes("sushi") ||
    combined.includes("ramen") ||
    combined.includes("asian")
  ) {
    return "Asian";
  }
  if (
    combined.includes("bar") ||
    combined.includes("happy hour") ||
    combined.includes("taproom")
  ) {
    return "Bars";
  }
  if (combined.includes("coffee") || combined.includes("espresso")) {
    return "Coffee";
  }

  return "";
}

function getEventPreferenceScore(
  category: string,
  preferredCategories: string[]
) {
  return preferredCategories.includes(category) ? 2 : 0;
}

function getFoodPreferenceScore(
  title: string,
  details: string,
  preferredFood: string[]
) {
  const foodType = getFoodTypeFromDeal(title, details);
  return foodType && preferredFood.includes(foodType) ? 2 : 0;
}

function getEventMatchReason(category: string, preferredCategories: string[]) {
  if (preferredCategories.includes(category)) {
    return `Matches your ${category} preference`;
  }

  return "";
}

function getFoodMatchReason(
  title: string,
  details: string,
  preferredFood: string[]
) {
  const foodType = getFoodTypeFromDeal(title, details);

  if (foodType && preferredFood.includes(foodType)) {
    return `Matches your ${foodType} food preference`;
  }

  return "";
}

function getScheduleBadge(scheduleType?: string, itemType?: string) {
  if (itemType === "birthday") {
    return {
      label: "Birthday",
      className: "bg-pink-100 text-pink-700",
    };
  }

  if (itemType === "food") {
    return {
      label: "Weekly Recurring",
      className: "bg-blue-100 text-blue-700",
    };
  }

  if (scheduleType === "recurring") {
    return {
      label: "Recurring",
      className: "bg-blue-100 text-blue-700",
    };
  }

  if (scheduleType === "one_off") {
    return {
      label: "One-Off",
      className: "bg-green-100 text-green-700",
    };
  }

  if (scheduleType === "seasonal") {
    return {
      label: "Seasonal",
      className: "bg-purple-100 text-purple-700",
    };
  }

  if (scheduleType === "schedule_driven") {
    return {
      label: "Schedule Driven",
      className: "bg-indigo-100 text-indigo-700",
    };
  }

  return {
    label: "Event",
    className: "bg-slate-100 text-slate-700",
  };
}

export default function HomePage() {
  const {
    events,
    foodDeals,
    birthdays,
    manualItems,
    foodDealCalendarSelections,
    settings,
    starredCount,
    calendarCount,
    foodDealsCount,
    birthdaysCount,
  } = useEvents();

  const now = new Date();
  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();
  const todayWeekdayShort = weekdayShortNames[now.getDay()];
  const todayLabel = `${weekdayLongNames[now.getDay()]}, ${
    monthNames[now.getMonth()]
  } ${todayDay}`;

  const preferredCategories = settings.preferredCategories ?? [];
  const preferredFood = settings.preferredFood ?? [];

  const todayBirthdays = birthdays.filter(
    (birthday) => birthday.month === todayMonth && birthday.day === todayDay
  );

  const todayEvents = events.filter(
    (event) => event.month === todayMonth && event.day === todayDay
  );

  const todayManualItems = manualItems.filter(
    (item) => item.month === todayMonth && item.day === todayDay
  );

  const todayFoodDeals = useMemo(() => {
    const regularDeals = foodDeals
      .filter((deal) => deal.days.includes(todayWeekdayShort))
      .map((deal) => {
        const score = getFoodPreferenceScore(
          deal.title,
          deal.details,
          preferredFood
        );

        return {
          title: deal.title,
          details: deal.details,
          icon: deal.icon ?? "🍽️",
          score,
          matchReason: getFoodMatchReason(
            deal.title,
            deal.details,
            preferredFood
          ),
          sourceType: deal.sourceType,
          sourceName: deal.sourceName,
          lastUpdated: deal.lastUpdated,
        };
      });

    const happyHourDeals = foodDealCalendarSelections
      .filter((selection) => selection.day === todayWeekdayShort)
      .map((selection) => {
        const matchingDeal = foodDeals.find(
          (deal) => deal.id === selection.dealId
        );

        if (!matchingDeal) return null;

        const score = getFoodPreferenceScore(
          matchingDeal.title,
          matchingDeal.details,
          preferredFood
        );

        return {
          title: matchingDeal.title,
          details: `${selection.day} Happy Hour · ${matchingDeal.details}`,
          icon: matchingDeal.icon ?? "🍸",
          score,
          matchReason: getFoodMatchReason(
            matchingDeal.title,
            matchingDeal.details,
            preferredFood
          ),
          sourceType: matchingDeal.sourceType,
          sourceName: matchingDeal.sourceName,
          lastUpdated: matchingDeal.lastUpdated,
        };
      })
      .filter(Boolean) as {
      title: string;
      details: string;
      icon: string;
      score: number;
      matchReason: string;
      sourceType?: string;
      sourceName?: string;
      lastUpdated?: string;
    }[];

    return [...regularDeals, ...happyHourDeals].sort(
      (a, b) => b.score - a.score
    );
  }, [foodDeals, foodDealCalendarSelections, todayWeekdayShort, preferredFood]);

  const todayItems: DashboardItem[] = [
    ...todayBirthdays.map((birthday) => ({
      title: `${birthday.name} ${birthday.personEmoji}`,
      details: `Turning ${now.getFullYear() - birthday.year}`,
      icon: "🎂",
      type: "birthday" as const,
      scheduleType: "birthday",
    })),
    ...todayEvents.map((event) => ({
      title: event.title,
      details: event.details,
      icon: event.icon ?? "🎉",
      type: "event" as const,
      category: event.category,
      isPreferenceMatch:
        getEventPreferenceScore(event.category, preferredCategories) > 0,
      matchReason: getEventMatchReason(event.category, preferredCategories),
      scheduleType: event.scheduleType,
      sourceType: event.sourceType,
      sourceName: event.sourceName,
      lastUpdated: event.lastUpdated,
    })),
    ...todayFoodDeals.map((deal) => ({
      title: deal.title,
      details: deal.details,
      icon: deal.icon,
      type: "food" as const,
      isPreferenceMatch: deal.score > 0,
      matchReason: deal.matchReason,
      scheduleType: "recurring",
      sourceType: deal.sourceType,
      sourceName: deal.sourceName,
      lastUpdated: deal.lastUpdated,
    })),
    ...todayManualItems.map((item) => ({
      title: item.text,
      details: "Manual reminder",
      icon: item.icon,
      type: "manual" as const,
    })),
  ];

  const tonightSuggestion = useMemo(() => {
    const plannedEvent = todayEvents.find((event) => event.calendar);

    if (plannedEvent) {
      const score = getEventPreferenceScore(
        plannedEvent.category,
        preferredCategories
      );

      return {
        title: plannedEvent.title,
        details: "Already on your calendar for today",
        icon: plannedEvent.icon ?? "🎉",
        badge: "Planned Tonight",
        isPreferenceMatch: score > 0,
        matchReason: getEventMatchReason(
          plannedEvent.category,
          preferredCategories
        ),
        scheduleType: plannedEvent.scheduleType,
        sourceType: plannedEvent.sourceType,
        sourceName: plannedEvent.sourceName,
        lastUpdated: plannedEvent.lastUpdated,
      };
    }

    const starredRanked = todayEvents
      .filter((event) => event.saved)
      .map((event) => ({
        ...event,
        preferenceScore: getEventPreferenceScore(
          event.category,
          preferredCategories
        ),
      }))
      .sort((a, b) => b.preferenceScore - a.preferenceScore);

    if (starredRanked.length > 0) {
      return {
        title: starredRanked[0].title,
        details: "You starred this and it’s happening today",
        icon: starredRanked[0].icon ?? "⭐",
        badge:
          starredRanked[0].preferenceScore > 0
            ? "Recommended for You"
            : "Watchlist Pick",
        isPreferenceMatch: starredRanked[0].preferenceScore > 0,
        matchReason: getEventMatchReason(
          starredRanked[0].category,
          preferredCategories
        ),
        scheduleType: starredRanked[0].scheduleType,
        sourceType: starredRanked[0].sourceType,
        sourceName: starredRanked[0].sourceName,
        lastUpdated: starredRanked[0].lastUpdated,
      };
    }

    if (todayFoodDeals.length > 0) {
      return {
        title: todayFoodDeals[0].title,
        details: todayFoodDeals[0].details,
        icon: todayFoodDeals[0].icon,
        badge:
          todayFoodDeals[0].score > 0
            ? "Recommended for You"
            : "Easy Tonight Option",
        isPreferenceMatch: todayFoodDeals[0].score > 0,
        matchReason: todayFoodDeals[0].matchReason,
        scheduleType: "recurring",
        sourceType: todayFoodDeals[0].sourceType,
        sourceName: todayFoodDeals[0].sourceName,
        lastUpdated: todayFoodDeals[0].lastUpdated,
      };
    }

    const nextRankedStarred = events
      .filter((event) => event.saved)
      .map((event) => ({
        ...event,
        eventDate: new Date(now.getFullYear(), event.month - 1, event.day),
        preferenceScore: getEventPreferenceScore(
          event.category,
          preferredCategories
        ),
      }))
      .sort((a, b) => {
        if (b.preferenceScore !== a.preferenceScore) {
          return b.preferenceScore - a.preferenceScore;
        }

        return a.eventDate.getTime() - b.eventDate.getTime();
      })[0];

    if (nextRankedStarred) {
      return {
        title: nextRankedStarred.title,
        details: `${monthNames[nextRankedStarred.month - 1]} ${
          nextRankedStarred.day
        } · ${nextRankedStarred.details}`,
        icon: nextRankedStarred.icon ?? "⭐",
        badge:
          nextRankedStarred.preferenceScore > 0
            ? "Recommended for You"
            : "Next Good Option",
        isPreferenceMatch: nextRankedStarred.preferenceScore > 0,
        matchReason: getEventMatchReason(
          nextRankedStarred.category,
          preferredCategories
        ),
        scheduleType: nextRankedStarred.scheduleType,
        sourceType: nextRankedStarred.sourceType,
        sourceName: nextRankedStarred.sourceName,
        lastUpdated: nextRankedStarred.lastUpdated,
      };
    }

    return {
      title: "Nothing planned tonight",
      details: "Star an event or add a food deal to start building your week.",
      icon: "✨",
      badge: "Open Night",
      isPreferenceMatch: false,
      matchReason: "",
      scheduleType: "",
      sourceType: "",
      sourceName: "",
      lastUpdated: "",
    };
  }, [todayEvents, todayFoodDeals, events, now, preferredCategories]);

  const weekendItems = useMemo(() => {
    const upcomingWeekendDates: Date[] = [];

    for (let i = 0; i < 14; i += 1) {
      const candidate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + i
      );

      const day = candidate.getDay();

      if (day === 6 || day === 0) {
        upcomingWeekendDates.push(candidate);
      }

      if (upcomingWeekendDates.length === 2) break;
    }

    const items: DashboardItem[] = [];

    upcomingWeekendDates.forEach((date) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();

      birthdays
        .filter((birthday) => birthday.month === month && birthday.day === day)
        .forEach((birthday) => {
          items.push({
            title: `${birthday.name} ${birthday.personEmoji}`,
            details: `${formatMonthDay(date)} · Birthday`,
            icon: "🎂",
            type: "birthday",
            sortDate: date,
            scheduleType: "birthday",
          });
        });

      events
        .filter((event) => event.month === month && event.day === day)
        .forEach((event) => {
          const score = getEventPreferenceScore(
            event.category,
            preferredCategories
          );

          items.push({
            title: event.title,
            details: `${formatMonthDay(date)} · ${event.details}`,
            icon: event.icon ?? "🎉",
            type: "event",
            category: event.category,
            sortDate: date,
            isPreferenceMatch: score > 0,
            matchReason: getEventMatchReason(
              event.category,
              preferredCategories
            ),
            scheduleType: event.scheduleType,
            sourceType: event.sourceType,
            sourceName: event.sourceName,
            lastUpdated: event.lastUpdated,
          });
        });

      manualItems
        .filter((item) => item.month === month && item.day === day)
        .forEach((item) => {
          items.push({
            title: item.text,
            details: `${formatMonthDay(date)} · Manual reminder`,
            icon: item.icon,
            type: "manual",
            sortDate: date,
          });
        });
    });

    return items
      .sort((a, b) => {
        const aTime = a.sortDate?.getTime() ?? 0;
        const bTime = b.sortDate?.getTime() ?? 0;

        if (aTime !== bTime) return aTime - bTime;

        const aPref = a.isPreferenceMatch ? 1 : 0;
        const bPref = b.isPreferenceMatch ? 1 : 0;

        if (bPref !== aPref) return bPref - aPref;

        const priority =
          (a.type === "birthday"
            ? 0
            : a.type === "event"
            ? 1
            : a.type === "food"
            ? 2
            : 3) -
          (b.type === "birthday"
            ? 0
            : b.type === "event"
            ? 1
            : b.type === "food"
            ? 2
            : 3);

        if (priority !== 0) return priority;

        return a.title.localeCompare(b.title);
      })
      .slice(0, 4);
  }, [birthdays, events, manualItems, now, preferredCategories]);

  const upcomingBirthdays = useMemo(() => {
    return [...birthdays]
      .map((birthday) => ({
        ...birthday,
        nextDate: getNextOccurrence(birthday.month, birthday.day, now),
      }))
      .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
      .slice(0, 3);
  }, [birthdays, now]);

  const personalizedSummary = [
    preferredCategories.length > 0
      ? `Categories: ${preferredCategories.join(", ")}`
      : "",
    preferredFood.length > 0 ? `Food: ${preferredFood.join(", ")}` : "",
  ].filter(Boolean);

  const tonightScheduleBadge = getScheduleBadge(
    tonightSuggestion.scheduleType,
    tonightSuggestion.scheduleType === "recurring" ? "food" : undefined
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
        <header className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-500">
            Good Times Calendar
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Plan more fun together
          </h1>
          <p className="mt-3 text-base text-slate-700">
            {settings.homeLocation
              ? `Your home base for ${settings.homeLocation}.`
              : "Your home base for tonight’s plan, this weekend, birthdays, and local fun."}
          </p>
        </header>

        {personalizedSummary.length > 0 ? (
          <section className="mb-6 rounded-[1.6rem] bg-white/85 p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
              Personalized For You
            </p>
            <div className="mt-2 space-y-1">
              {personalizedSummary.map((line) => (
                <p key={line} className="text-sm text-slate-700">
                  {line}
                </p>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mb-6 rounded-[2rem] bg-white/85 p-5 shadow-sm ring-1 ring-black/5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-orange-500">
                Today
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
                {todayLabel}
              </h2>
            </div>

            <Link
              href="/calendar"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white"
            >
              View Day
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {todayItems.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">
                Nothing is scheduled for today yet.
              </div>
            ) : (
              todayItems.slice(0, 4).map((item, index) => {
                const scheduleBadge = getScheduleBadge(
                  item.scheduleType,
                  item.type
                );

                return (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded-3xl bg-orange-50/70 p-4 ring-1 ring-orange-100"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900">
                            {item.title}
                          </h3>

                          {item.isPreferenceMatch ? (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                              Match
                            </span>
                          ) : null}

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${scheduleBadge.className}`}
                          >
                            {scheduleBadge.label}
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {item.details}
                        </p>

                        {item.matchReason ? (
                          <p className="mt-1 text-xs font-semibold text-blue-700">
                            Why match: {item.matchReason}
                          </p>
                        ) : null}

                        {item.sourceType === "imported" && item.sourceName ? (
                          <p className="mt-1 text-[11px] text-slate-500">
                            Imported from {item.sourceName}
                            {item.lastUpdated
                              ? ` · Reviewed ${item.lastUpdated}`
                              : ""}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <Link
            href="/starred"
            className="rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 transition hover:scale-[1.02]"
          >
            <p className="text-sm font-medium text-slate-500">Starred</p>
            <p className="mt-2 text-3xl font-bold">{starredCount}</p>
            <p className="mt-1 text-sm text-slate-600">
              {starredCount === 1
                ? "1 event you're watching"
                : `${starredCount} events you're watching`}
            </p>
          </Link>

          <Link
            href="/calendar"
            className="rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 transition hover:scale-[1.02]"
          >
            <p className="text-sm font-medium text-slate-500">Calendar</p>
            <p className="mt-2 text-3xl font-bold">{calendarCount}</p>
            <p className="mt-1 text-sm text-slate-600">
              {calendarCount === 1
                ? "1 item planned"
                : `${calendarCount} items planned`}
            </p>
          </Link>

          <Link
            href="/food-deals"
            className="rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 transition hover:scale-[1.02]"
          >
            <p className="text-sm font-medium text-slate-500">Food Deals</p>
            <p className="mt-2 text-3xl font-bold">{foodDealsCount}</p>
            <p className="mt-1 text-sm text-slate-600">
              {foodDealsCount} active weekly specials
            </p>
          </Link>

          <Link
            href="/birthdays"
            className="rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 transition hover:scale-[1.02]"
          >
            <p className="text-sm font-medium text-slate-500">Birthdays</p>
            <p className="mt-2 text-3xl font-bold">{birthdaysCount}</p>
            <p className="mt-1 text-sm text-slate-600">
              {birthdaysCount} tracked birthdays
            </p>
          </Link>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white/85 p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-bold uppercase tracking-wide text-pink-500">
            Tonight’s Suggestion
          </p>

          <div className="mt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl">{tonightSuggestion.icon}</span>
              <h3 className="text-xl font-extrabold">
                {tonightSuggestion.title}
              </h3>

              {tonightSuggestion.isPreferenceMatch ? (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  Preference Match
                </span>
              ) : null}

              {tonightSuggestion.scheduleType ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tonightScheduleBadge.className}`}
                >
                  {tonightScheduleBadge.label}
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-sm font-medium text-slate-700">
              {tonightSuggestion.details}
            </p>

            {tonightSuggestion.matchReason ? (
              <p className="mt-1 text-xs font-semibold text-blue-700">
                Why this fits: {tonightSuggestion.matchReason}
              </p>
            ) : null}

            {tonightSuggestion.sourceType === "imported" &&
            tonightSuggestion.sourceName ? (
              <p className="mt-1 text-[11px] text-slate-500">
                Imported from {tonightSuggestion.sourceName}
                {tonightSuggestion.lastUpdated
                  ? ` · Reviewed ${tonightSuggestion.lastUpdated}`
                  : ""}
              </p>
            ) : null}

            <div className="mt-3 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
              {tonightSuggestion.badge}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white/85 p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
              This Weekend
            </p>
            <Link href="/discover" className="text-sm font-bold text-orange-600">
              Explore
            </Link>
          </div>

          <div className="mt-3 space-y-3">
            {weekendItems.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">
                Nothing is lined up for this weekend yet.
              </div>
            ) : (
              weekendItems.map((item, index) => {
                const scheduleBadge = getScheduleBadge(
                  item.scheduleType,
                  item.type
                );

                return (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded-3xl bg-orange-50/70 p-4 ring-1 ring-orange-100"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900">
                            {item.title}
                          </h3>

                          {item.isPreferenceMatch ? (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                              Match
                            </span>
                          ) : null}

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${scheduleBadge.className}`}
                          >
                            {scheduleBadge.label}
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {item.details}
                        </p>

                        {item.sortDate ? (
                          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-orange-600">
                            {getDayBadgeLabel(item.sortDate, now)}
                          </p>
                        ) : null}

                        {item.matchReason ? (
                          <p className="mt-1 text-xs font-semibold text-blue-700">
                            Why match: {item.matchReason}
                          </p>
                        ) : null}

                        {item.sourceType === "imported" && item.sourceName ? (
                          <p className="mt-1 text-[11px] text-slate-500">
                            Imported from {item.sourceName}
                            {item.lastUpdated
                              ? ` · Reviewed ${item.lastUpdated}`
                              : ""}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white/85 p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wide text-pink-600">
              Upcoming Birthdays
            </p>
            <Link href="/birthdays" className="text-sm font-bold text-orange-600">
              View all
            </Link>
          </div>

          <div className="mt-3 space-y-3">
            {upcomingBirthdays.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">
                No birthdays added yet.
              </div>
            ) : (
              upcomingBirthdays.map((birthday) => (
                <div
                  key={birthday.id}
                  className="rounded-3xl bg-pink-50/70 p-4 ring-1 ring-pink-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎂</span>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {birthday.name} {birthday.personEmoji}
                    </h3>
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {formatMonthDay(birthday.nextDate)}
                  </p>
                  <p className="mt-1 text-sm font-bold text-pink-600">
                    Turning {birthday.nextDate.getFullYear() - birthday.year}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}