"use client";

import { useMemo, useState } from "react";
import { useEvents } from "../events-context";

type FilterType =
  | "All"
  | "Local"
  | "Regional"
  | "Trivia"
  | "Live Music"
  | "Community"
  | "Food"
  | "Sports"
  | "Comedy";

const filters: FilterType[] = [
  "All",
  "Local",
  "Regional",
  "Trivia",
  "Live Music",
  "Community",
  "Food",
  "Sports",
  "Comedy",
];

export default function DiscoverPage() {
  const {
    events,
    settings,
    importedEventsCount,
    toggleSaved,
    toggleCalendar,
  } = useEvents();
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");

  const preferredCategories = settings.preferredCategories ?? [];

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return events
      .filter((event) => {
        const matchesFilter =
          activeFilter === "All"
            ? true
            : activeFilter === "Local" || activeFilter === "Regional"
              ? event.badge === activeFilter
              : event.category === activeFilter;

        const matchesSearch =
          normalizedSearch.length === 0
            ? true
            : event.title.toLowerCase().includes(normalizedSearch) ||
              event.details.toLowerCase().includes(normalizedSearch) ||
              event.category.toLowerCase().includes(normalizedSearch) ||
              event.sourceName.toLowerCase().includes(normalizedSearch);

        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        const aImported = a.sourceType === "imported" ? 1 : 0;
        const bImported = b.sourceType === "imported" ? 1 : 0;
        if (bImported !== aImported) return bImported - aImported;

        const aPreferred = preferredCategories.includes(a.category) ? 1 : 0;
        const bPreferred = preferredCategories.includes(b.category) ? 1 : 0;
        if (bPreferred !== aPreferred) return bPreferred - aPreferred;

        if (Number(b.featured) !== Number(a.featured)) {
          return Number(b.featured) - Number(a.featured);
        }
        return a.title.localeCompare(b.title);
      });
  }, [events, activeFilter, search, preferredCategories]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50 px-4 py-5 text-slate-900 sm:p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Discover Events
        </h1>
        <p className="mt-1 text-sm text-slate-700 sm:text-base">
          Browse local and regional fun around you.
          {settings.homeLocation ? ` Tuned for ${settings.homeLocation}.` : ""}
        </p>
      </div>

      <div className="mb-4 rounded-[1.4rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
          Data Status
        </p>
        <p className="mt-1 text-sm text-slate-700">
          Imported live-ish events loaded: {importedEventsCount}
        </p>
      </div>

      {(settings.preferredCategories.length > 0 || settings.preferredFood.length > 0) && (
        <div className="mb-4 rounded-[1.4rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
            Using Your Preferences
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {settings.preferredCategories.length > 0
              ? `Prioritizing: ${settings.preferredCategories.join(", ")}`
              : "No preferred event categories selected yet."}
          </p>
        </div>
      )}

      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-300"
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => {
          const isActive = activeFilter === filter;

          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 ring-1 ring-black/5"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="rounded-3xl bg-white p-4 text-sm text-slate-500 shadow-sm ring-1 ring-black/5">
            No events match this search/filter yet.
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isRecommended = preferredCategories.includes(event.category);
            const isImported = event.sourceType === "imported";

            return (
              <div
                key={event.id}
                className={`rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-black/5 transition ${
                  event.calendar ? "ring-2 ring-green-100" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
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
                      {isRecommended ? (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
                          Recommended for You
                        </span>
                      ) : null}
                      {isImported ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                          Imported Data
                        </span>
                      ) : null}
                    </div>

                    <h2 className="mt-2 text-lg font-extrabold text-slate-900 sm:text-xl">
                      {event.title}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {event.details}
                    </p>

                    <p className="mt-2 text-[11px] font-medium text-slate-500">
                      Source: {event.sourceName}
                      {event.lastUpdated ? ` · Updated ${event.lastUpdated}` : ""}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleCalendar(event.id)}
                        className={`rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
                          event.calendar
                            ? "bg-green-600 text-white"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                      >
                        {event.calendar ? "Added ✓" : "Add to Calendar"}
                      </button>

                      <button
                        onClick={() => toggleSaved(event.id)}
                        className={`rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
                          event.saved
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {event.saved ? "⭐ Starred" : "☆ Star"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}