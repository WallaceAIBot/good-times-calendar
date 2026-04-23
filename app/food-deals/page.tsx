"use client";

import { useMemo, useState } from "react";
import { useEvents } from "../events-context";

type FilterPill =
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri"
  | "Sat"
  | "Sun"
  | "Happy Hour";

const pills: FilterPill[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
  "Happy Hour",
];

function getFreshnessInfo(lastUpdated: string) {
  if (!lastUpdated) {
    return {
      label: "Unknown",
      className: "bg-slate-100 text-slate-600",
    };
  }

  const updated = new Date(`${lastUpdated}T00:00:00`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = today.getTime() - updated.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      label: "Updated Today",
      className: "bg-green-100 text-green-700",
    };
  }

  if (diffDays <= 7) {
    return {
      label: "This Week",
      className: "bg-blue-100 text-blue-700",
    };
  }

  return {
    label: "Older",
    className: "bg-amber-100 text-amber-700",
  };
}

export default function FoodDealsPage() {
  const {
    foodDeals,
    importedFoodDealsCount,
    toggleFoodDealCalendar,
    toggleFoodDealDayCalendar,
    isFoodDealDayInCalendar,
  } = useEvents();

  const [activePill, setActivePill] = useState<FilterPill>("Mon");
  const [selectedHappyHourDay, setSelectedHappyHourDay] = useState<string>("Mon");

  const filteredDeals = useMemo(() => {
    if (activePill === "Happy Hour") {
      return foodDeals.filter((deal) => deal.isHappyHour);
    }

    return foodDeals.filter((deal) => deal.days.includes(activePill));
  }, [foodDeals, activePill]);

  const sectionTitle =
    activePill === "Happy Hour"
      ? "Happy Hour Picks"
      : `${activePill} Specials`;

  const sectionSubtitle =
    activePill === "Happy Hour"
      ? "Choose a weekday, then add that specific happy hour to your calendar."
      : `Deals available on ${activePill}.`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50 px-4 py-5 text-slate-900 sm:p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Food Deals
        </h1>
        <p className="mt-1 text-sm text-slate-700 sm:text-base">
          Find the best recurring specials and happy hours.
        </p>
      </div>

      <div className="mb-4 rounded-[1.4rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
          Data Status
        </p>
        <p className="mt-1 text-sm text-slate-700">
          Imported food deals loaded: {importedFoodDealsCount}
        </p>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {pills.map((pill) => {
          const isActive = activePill === pill;

          return (
            <button
              key={pill}
              onClick={() => setActivePill(pill)}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 ring-1 ring-black/5"
              }`}
            >
              {pill}
            </button>
          );
        })}
      </div>

      <section className="mb-3">
        <h2 className="text-2xl font-extrabold tracking-tight">{sectionTitle}</h2>
        <p className="mt-1 text-sm font-medium text-slate-600">
          {sectionSubtitle}
        </p>
      </section>

      <div className="space-y-3">
        {filteredDeals.length === 0 ? (
          <div className="rounded-[1.6rem] bg-white p-5 text-sm text-slate-500 shadow-sm ring-1 ring-black/5">
            No food deals loaded for this filter yet.
          </div>
        ) : (
          filteredDeals.map((deal) => {
            const happyHourAdded =
              activePill === "Happy Hour" &&
              isFoodDealDayInCalendar(deal.id, selectedHappyHourDay);
            const freshness = getFreshnessInfo(deal.lastUpdated);

            return (
              <div
                key={deal.id}
                className={`rounded-[1.6rem] border bg-white p-4 shadow-sm transition ${
                  deal.calendar || happyHourAdded
                    ? "border-green-200 ring-2 ring-green-100"
                    : "border-black/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xl">{deal.icon ?? "🍽️"}</span>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-orange-600">
                        {deal.category}
                      </p>

                      {deal.isHappyHour ? (
                        <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-pink-700">
                          Happy Hour
                        </span>
                      ) : null}

                      {deal.sourceType === "imported" ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                          Imported Data
                        </span>
                      ) : null}

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${freshness.className}`}
                      >
                        {freshness.label}
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg font-extrabold text-slate-900 sm:text-xl">
                      {deal.title}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {deal.details}
                    </p>

                    <div className="mt-2 rounded-2xl bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-medium text-slate-600">
                        Source: <span className="font-semibold text-slate-800">{deal.sourceName}</span>
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Type: {deal.sourceType} · Last updated: {deal.lastUpdated || "unknown"}
                      </p>
                      {deal.sourceUrl ? (
                        <p className="mt-1 truncate text-[11px] text-slate-500">
                          {deal.sourceUrl}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {deal.days.map((day) => {
                        const isSelected =
                          activePill === "Happy Hour" && selectedHappyHourDay === day;

                        return (
                          <button
                            key={`${deal.id}-${day}`}
                            onClick={() =>
                              activePill === "Happy Hour"
                                ? setSelectedHappyHourDay(day)
                                : null
                            }
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                              activePill === "Happy Hour"
                                ? isSelected
                                  ? "bg-slate-900 text-white"
                                  : "bg-orange-100 text-orange-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3">
                      {activePill === "Happy Hour" ? (
                        <button
                          onClick={() =>
                            toggleFoodDealDayCalendar(deal.id, selectedHappyHourDay)
                          }
                          className={`rounded-full px-3 py-2 text-xs font-bold text-white transition sm:px-4 sm:text-sm ${
                            happyHourAdded
                              ? "bg-green-700 shadow-sm"
                              : "bg-slate-900 hover:bg-slate-800"
                          }`}
                        >
                          {happyHourAdded
                            ? `${selectedHappyHourDay} Added ✓`
                            : `+ Add ${selectedHappyHourDay}`}
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleFoodDealCalendar(deal.id)}
                          className={`rounded-full px-3 py-2 text-xs font-bold text-white transition sm:px-4 sm:text-sm ${
                            deal.calendar
                              ? "bg-green-700 shadow-sm"
                              : "bg-slate-900 hover:bg-slate-800"
                          }`}
                        >
                          {deal.calendar ? "Added to Calendar ✓" : "+ Add"}
                        </button>
                      )}
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