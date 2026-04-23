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
    }
  ]
}`;

export default function ImportPage() {
  const {
    importedEventsCount,
    importedFoodDealsCount,
    importEventsFromJson,
    importFoodDealsFromJson,
    clearImportedEvents,
    clearImportedFoodDeals,
  } = useEvents();

  const [eventsJson, setEventsJson] = useState(sampleEventsJson);
  const [dealsJson, setDealsJson] = useState(sampleDealsJson);
  const [eventsStatus, setEventsStatus] = useState("");
  const [dealsStatus, setDealsStatus] = useState("");

  const handleImportEvents = () => {
    try {
      const parsed = JSON.parse(eventsJson);
      importEventsFromJson(parsed);
      setEventsStatus("Imported events successfully ✓");
    } catch {
      setEventsStatus("Event JSON is invalid");
    }
  };

  const handleImportDeals = () => {
    try {
      const parsed = JSON.parse(dealsJson);
      importFoodDealsFromJson(parsed);
      setDealsStatus("Imported food deals successfully ✓");
    } catch {
      setDealsStatus("Food deal JSON is invalid");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50 px-4 py-5 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-3xl">
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
          </div>

          <div className="rounded-[1.4rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
              Imported Food Deals
            </p>
            <p className="mt-1 text-2xl font-extrabold">{importedFoodDealsCount}</p>
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold">Import Events JSON</h2>
              <button
                onClick={clearImportedEvents}
                className="rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
              >
                Clear Imported Events
              </button>
            </div>

            <textarea
              value={eventsJson}
              onChange={(e) => setEventsJson(e.target.value)}
              className="mt-4 min-h-[260px] w-full rounded-2xl border border-black/10 p-4 font-mono text-xs outline-none focus:border-orange-300"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={handleImportEvents}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Import Events
              </button>
              {eventsStatus ? (
                <p className="self-center text-sm font-medium text-slate-700">
                  {eventsStatus}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold">Import Food Deals JSON</h2>
              <button
                onClick={clearImportedFoodDeals}
                className="rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
              >
                Clear Imported Food Deals
              </button>
            </div>

            <textarea
              value={dealsJson}
              onChange={(e) => setDealsJson(e.target.value)}
              className="mt-4 min-h-[260px] w-full rounded-2xl border border-black/10 p-4 font-mono text-xs outline-none focus:border-orange-300"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={handleImportDeals}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Import Food Deals
              </button>
              {dealsStatus ? (
                <p className="self-center text-sm font-medium text-slate-700">
                  {dealsStatus}
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}