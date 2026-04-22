"use client";

import { useEvents } from "../events-context";

export default function StarredPage() {
  const { events, toggleCalendar, toggleSaved } = useEvents();
  const savedEvents = events.filter((event) => event.saved);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50 px-4 py-5 text-slate-900 sm:p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Starred Events
        </h1>
        <p className="mt-1 text-sm text-slate-700 sm:text-base">
          Your saved watchlist for possible plans.
        </p>
      </div>

      <div className="space-y-3">
        {savedEvents.length === 0 ? (
          <div className="rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <p className="text-sm text-slate-500">
              No starred events yet. Save a few from Discover and they’ll show up here.
            </p>
          </div>
        ) : (
          savedEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg">{event.icon ?? "✨"}</span>
                <p className="text-[11px] font-bold uppercase tracking-wide text-orange-600">
                  {event.category}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    event.badge === "Regional"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {event.badge}
                </span>
              </div>

              <h2 className="mt-2 text-lg font-extrabold text-slate-900 sm:text-xl">
                {event.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {event.details}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => toggleCalendar(event.id)}
                  className={`rounded-full px-3 py-2 text-xs font-bold text-white transition sm:px-4 sm:text-sm ${
                    event.calendar
                      ? "bg-green-600"
                      : "bg-slate-900 hover:bg-slate-800"
                  }`}
                >
                  {event.calendar ? "Added ✓" : "Add to Calendar"}
                </button>

                <button
                  onClick={() => toggleSaved(event.id)}
                  className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 sm:px-4 sm:text-sm"
                >
                  Remove Star
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}