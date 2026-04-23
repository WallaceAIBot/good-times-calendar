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
    importEventsFromJson,
    importFoodDealsFromJson,
    clearImportedEvents,
    clearImportedFoodDeals,
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
    setEventsStatus("Cleared imported events.");
    setEventsStatusType("idle");
  };

  const handleClearImportedDeals = () => {
    clearImportedFoodDeals();
    setDealsStatus("Cleared imported food deals.");
    setDealsStatusType("idle");
  };

  const statusClass = (type: StatusType) => {
    if (type === "success") {
      return "text-green-700";
    }

    if (type === "error") {
      return "text-red-700";
    }

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
              Discover will prioritize imported items above seeded mock items.
            </p>
          </div>

          <div className="rounded-[1.4rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
              Imported Food Deals
            </p>
            <p className="mt-1 text-2xl font-extrabold">{importedFoodDealsCount}</p>
            <p className="mt-1 text-sm text-slate-600">
              Food Deals will label imported rows so you can tell where they came from.
            </p>
          </div>
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
                Each event should include title, details, month, day, weekday, and category.
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
                Each deal should include title, details, days, category, and whether it is happy hour.
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
              <p>• Imported items are labeled so you can spot them easily.</p>
              <p>• Duplicate imports from the same source are filtered as best as possible.</p>
              <p>• Imported events appear in Discover, and imported deals appear in Food Deals.</p>
              <p>• Later we can hook a scraper or API output directly into this same JSON format.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}