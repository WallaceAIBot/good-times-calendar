"use client";

import Link from "next/link";
import { useEvents } from "./events-context";

const CURRENT_YEAR = 2026;

function getFoodEmoji(title: string) {
  if (title.includes("St. Charles")) return "🍔";
  if (title.includes("Gia Mia")) return "🍕";
  if (title.includes("Moto Imoto")) return "🍣";
  return "🍽️";
}

export default function HomePage() {
  const {
    starredCount,
    calendarCount,
    foodDealsCount,
    birthdaysCount,
    featuredEvents,
    featuredFoodDeal,
    upcomingBirthdays,
  } = useEvents();

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
            A simple family planner for local events, food deals, birthdays,
            and fun nights out.
          </p>
        </header>

        <section className="mb-6 rounded-[2rem] bg-white/85 p-5 shadow-sm ring-1 ring-black/5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-orange-500">
                This Weekend
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
                Featured Plans
              </h2>
            </div>

            <Link
              href="/discover"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white"
            >
              Explore
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {featuredEvents.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">
                No featured events yet.
              </div>
            ) : (
              featuredEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-3xl bg-orange-50/70 p-4 ring-1 ring-orange-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{event.icon ?? "✨"}</span>
                        <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                          {event.category}
                        </p>
                      </div>

                      <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                        {event.title}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {event.details}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        event.badge === "Regional"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {event.badge}
                    </span>
                  </div>
                </div>
              ))
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
            Tonight’s Food Pick
          </p>

          {featuredFoodDeal ? (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {featuredFoodDeal.icon ?? getFoodEmoji(featuredFoodDeal.title)}
                </span>
                <h3 className="text-xl font-extrabold">{featuredFoodDeal.title}</h3>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {featuredFoodDeal.details}
              </p>
              <div className="mt-3 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
                Best deal tonight
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              No food deal suggestion yet.
            </p>
          )}
        </section>

        <section className="mt-6 rounded-[2rem] bg-white/85 p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wide text-pink-600">
              Upcoming Birthdays
            </p>
            <Link
              href="/birthdays"
              className="text-sm font-bold text-orange-600"
            >
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
                    {birthday.date}
                  </p>
                  <p className="mt-1 text-sm font-bold text-pink-600">
                    Turning {CURRENT_YEAR - birthday.year}
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