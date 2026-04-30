"use client";

import { useState } from "react";
import { useEvents } from "../events-context";

const sampleEventsJson = `{
  "sourceName": "Downtown St. Charles Feed",
  "sourceUrl": "https://example.com/events",
  "events": [
    {
      "category": "Community",
      "title": "Riverside Summer Kickoff",
      "details": "Saturday · 4 PM · 9 miles away",
      "badge": "Local",
      "icon": "🎉",
      "featured": true,
      "month": 5,
      "day": 9,
      "weekday": "Sat",
      "scheduleType": "one_off",
      "lastUpdated": "2026-04-23"
    },
    {
      "category": "Comedy",
      "title": "Open Mic Laugh Night",
      "details": "Friday · 8 PM · 11 miles away",
      "badge": "Regional",
      "icon": "🎤",
      "featured": false,
      "month": 5,
      "day": 8,
      "weekday": "Fri",
      "scheduleType": "recurring",
      "lastUpdated": "2026-04-23"
    },
    {
      "category": "Sports",
      "title": "Thirsty Thursday Cougars Game",
      "details": "Thursday · 6:30 PM · 12 miles away",
      "badge": "Local",
      "icon": "⚾",
      "featured": false,
      "month": 5,
      "day": 14,
      "weekday": "Thu",
      "scheduleType": "schedule_driven",
      "lastUpdated": "2026-04-23"
    }
  ]
}`;

const sampleDealsJson = `{
  "sourceName": "Local Restaurant Sheet",
  "sourceUrl": "https://example.com/deals",
  "deals": [
    {
      "category": "Burger Night",
      "title": "Local Tap House",
      "details": "Two-for-one burgers",
      "icon": "🍔",
      "featured": false,
      "days": ["Tue"],
      "isHappyHour": false,
      "lastUpdated": "2026-04-23"
    },
    {
      "category": "Happy Hour",
      "title": "Downtown Sushi Bar",
      "details": "4–6 PM happy hour",
      "icon": "🍣",
      "featured": true,
      "days": ["Wed", "Thu", "Fri"],
      "isHappyHour": true,
      "lastUpdated": "2026-04-23"
    }
  ]
}`;

type StatusType = "idle" | "success" | "error";

export default function ImportPage() {
  const {
    importedEventsCount,
    importedFoodDealsCount,
    importedSources,
    importEventsFromJson,
    importFoodDealsFromJson,
    clearImportedEvents,
    clearImportedFoodDeals,
    clearImportedSource,
    addAllImportedEventsToCalendar,
  } = useEvents();

  const [eventsJson, setEventsJson] = useState(sampleEventsJson);
  const [dealsJson, setDealsJson] = useState(sampleDealsJson);

  const [eventsStatus, setEventsStatus] = useState("");
  const [dealsStatus, setDealsStatus] = useState("");
  const [eventsStatusType, setEventsStatusType] = useState<StatusType>("idle");
  const [dealsStatusType, setDealsStatusType] = useState<StatusType>("idle");

  const handleImportEvents = () => {
    try {
      const parsed = JSON.parse(eventsJson);

      if (!parsed || !Array.isArray(parsed.events) || !parsed.sourceName) {
        setEventsStatus("Event JSON needs sourceName and an events array.");
        setEventsStatusType("error");
        return;
      }

      importEventsFromJson(parsed);
      setEventsStatus("Imported events successfully ✓");
      setEventsStatusType("success");
    } catch {
      setEventsStatus("Event JSON is invalid.");
      setEventsStatusType("error");
    }
  };

  const handleImportDeals = () => {
    try {
      const parsed = JSON.parse(dealsJson);

      if (!parsed || !Array.isArray(parsed.deals) || !parsed.sourceName) {
        setDealsStatus("Food deal JSON needs sourceName and a deals array.");
        setDealsStatusType("error");
        return;
      }

      importFoodDealsFromJson(parsed);
      setDealsStatus("Imported food deals successfully ✓");
      setDealsStatusType("success");
    } catch {
      setDealsStatus("Food deal JSON is invalid.");
      setDealsStatusType("error");
    }
  };

  const handleLoadSampleEvents = () => {
    setEventsJson(sampleEventsJson);
    setEventsStatus("Loaded sample event JSON.");
    setEventsStatusType("idle");
  };

  const handleLoadSampleDeals = () => {
    setDealsJson(sampleDealsJson);
    setDealsStatus("Loaded sample food deal JSON.");
    setDealsStatusType("idle");
  };

  const handleClearImportedEvents = () => {
    clearImportedEvents();
    setEventsStatus("Cleared all imported events.");
    setEventsStatusType("idle");
  };

  const handleClearImportedDeals = () => {
    clearImportedFoodDeals();
    setDealsStatus("Cleared all imported food deals.");
    setDealsStatusType("idle");
  };

  const statusClass = (type: StatusType) => {
    if (type === "success") return "text-green-700";
    if (type === "error") return "text-red-700";
    return "text-slate-600";
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50 px-4 py-5 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Import Data
          </h1>
          <p className="mt-1 text-sm text-slate-700 sm:text-base">
            Paste real JSON from a scraper, spreadsheet export, or future API feed.
          </p>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.4rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
              Imported Events
            </p>
            <p className="mt-1 text-2xl font-extrabold">{importedEventsCount}</p>
            <p className="mt-1 text-sm text-slate-600">
              Discover prioritizes imported items above seeded mock items.
            </p>
          </div>

          <div className="rounded-[1.4rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
              Imported Food Deals
            </p>
            <p className="mt-1 text-2xl font-extrabold">{importedFoodDealsCount}</p>
            <p className="mt-1 text-sm text-slate-600">
              Food Deals labels imported rows so you can track source quality.
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="text-xl font-bold">Imported Sources</h2>

          {importedSources.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No imported sources yet.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {importedSources.map((source) => (
                <div
                  key={source.sourceName}
                  className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900">
                          {source.sourceName}
                        </h3>
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
                          {source.sourceType}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-700">
                        Events: {source.eventCount} · Food Deals: {source.foodDealCount}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Last Updated: {source.lastUpdated}
                      </p>
                      {source.sourceUrl ? (
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {source.sourceUrl}
                        </p>
                      ) : null}
                    </div>

                    <button
                      onClick={() => clearImportedSource(source.sourceName)}
                      className="rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
                    >
                      Clear Source
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-5 rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="text-xl font-bold">Quick Format Guide</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                Events JSON needs
              </p>
              <p className="mt-2 text-sm text-slate-700">
                `sourceName`, optional `sourceUrl`, and an `events` array.
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Events can include `scheduleType`: recurring, one_off, seasonal, or schedule_driven.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                Food Deal JSON needs
              </p>
              <p className="mt-2 text-sm text-slate-700">
                `sourceName`, optional `sourceUrl`, and a `deals` array.
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Food deals are treated as recurring weekly schedules, not one-off stale events.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold">Import Events JSON</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleLoadSampleEvents}
                  className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                >
                  Load Sample
                </button>
                <button
                  onClick={handleClearImportedEvents}
                  className="rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
                >
                  Clear Imported Events
                </button>
                <button
  onClick={addAllImportedEventsToCalendar}
  className="rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white"
>
  Add ALL Imported Events to Calendar
</button>
              </div>
            </div>

            <textarea
              value={eventsJson}
              onChange={(e) => {
                setEventsJson(e.target.value);
                setEventsStatus("");
                setEventsStatusType("idle");
              }}
              className="mt-4 min-h-[280px] w-full rounded-2xl border border-black/10 p-4 font-mono text-xs outline-none focus:border-orange-300"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={handleImportEvents}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Import Events
              </button>

              {eventsStatus ? (
                <p className={`text-sm font-medium ${statusClass(eventsStatusType)}`}>
                  {eventsStatus}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold">Import Food Deals JSON</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleLoadSampleDeals}
                  className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                >
                  Load Sample
                </button>
                <button
                  onClick={handleClearImportedDeals}
                  className="rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
                >
                  Clear Imported Food Deals
                </button>
              </div>
            </div>

            <textarea
              value={dealsJson}
              onChange={(e) => {
                setDealsJson(e.target.value);
                setDealsStatus("");
                setDealsStatusType("idle");
              }}
              className="mt-4 min-h-[280px] w-full rounded-2xl border border-black/10 p-4 font-mono text-xs outline-none focus:border-orange-300"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={handleImportDeals}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Import Food Deals
              </button>

              {dealsStatus ? (
                <p className={`text-sm font-medium ${statusClass(dealsStatusType)}`}>
                  {dealsStatus}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="text-xl font-bold">Tips</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>• Use `one_off` for festivals, popups, and single-date events.</p>
              <p>• Use `recurring` for weekly trivia, open mic nights, and repeating schedules.</p>
              <p>• Use `schedule_driven` for promo calendars that may change, like sports promo nights.</p>
              <p>• Food deals stay on recurring logic so they do not get misleading stale warnings.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}