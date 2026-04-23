"use client";

import { useEffect, useMemo, useState } from "react";
import { useEvents } from "../events-context";

const categories = [
  "Trivia",
  "Live Music",
  "Community",
  "Food",
  "Sports",
  "Comedy",
];

const foodTypes = [
  "Pizza",
  "Burgers",
  "Mexican",
  "Asian",
  "Bars",
  "Coffee",
];

export default function SettingsPage() {
  const { settings, updateSettings } = useEvents();
  const [localSettings, setLocalSettings] = useState(settings);
  const [savedState, setSavedState] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    setSavedState("idle");
  }, [localSettings]);

  const toggleItem = (list: string[], item: string) => {
    return list.includes(item)
      ? list.filter((i) => i !== item)
      : [...list, item];
  };

  const saveSettings = () => {
    updateSettings(localSettings);
    setSavedState("saved");
  };

  const activeSummary = useMemo(() => {
    const parts: string[] = [];

    if (settings.homeLocation.trim()) {
      parts.push(`Home: ${settings.homeLocation}`);
    }

    if (settings.preferredCategories.length > 0) {
      parts.push(`Categories: ${settings.preferredCategories.join(", ")}`);
    }

    if (settings.preferredFood.length > 0) {
      parts.push(`Food: ${settings.preferredFood.join(", ")}`);
    }

    return parts;
  }, [settings]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50 px-4 py-5 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-700 sm:text-base">
            Personalize the app for your location and preferences.
          </p>
        </div>

        <div className="mb-4 rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
            Active Preferences
          </p>

          {activeSummary.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              No saved preferences yet.
            </p>
          ) : (
            <div className="mt-2 space-y-1">
              {activeSummary.map((line) => (
                <p key={line} className="text-sm font-medium text-slate-700">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5 rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Home Location
            </label>
            <input
              value={localSettings.homeLocation}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  homeLocation: e.target.value,
                })
              }
              placeholder="Maple Park, IL"
              className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-300"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Preferred Event Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected =
                  localSettings.preferredCategories.includes(category);

                return (
                  <button
                    key={category}
                    onClick={() =>
                      setLocalSettings({
                        ...localSettings,
                        preferredCategories: toggleItem(
                          localSettings.preferredCategories,
                          category
                        ),
                      })
                    }
                    className={`rounded-full px-3 py-2 text-sm font-semibold ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Favorite Food Types
            </label>
            <div className="flex flex-wrap gap-2">
              {foodTypes.map((food) => {
                const isSelected = localSettings.preferredFood.includes(food);

                return (
                  <button
                    key={food}
                    onClick={() =>
                      setLocalSettings({
                        ...localSettings,
                        preferredFood: toggleItem(
                          localSettings.preferredFood,
                          food
                        ),
                      })
                    }
                    className={`rounded-full px-3 py-2 text-sm font-semibold ${
                      isSelected
                        ? "bg-orange-500 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {food}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={saveSettings}
            className={`w-full rounded-full px-4 py-3 text-sm font-semibold text-white transition ${
              savedState === "saved" ? "bg-green-600" : "bg-slate-900"
            }`}
          >
            {savedState === "saved" ? "Saved ✓" : "Save Settings"}
          </button>
        </div>
      </div>
    </main>
  );
}