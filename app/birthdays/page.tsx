"use client";

import { useMemo, useState } from "react";
import { useEvents } from "../events-context";

const CURRENT_YEAR = 2026;

const birthdayEmojiOptions = [
  "😎","🥸","🤠","🥳","😷","🤡","💩","👽","😈","💀",
  "🤖","👶","🧒","👧","👱","👨","🧔‍♂️","🧔‍♀️","👨‍🦰","👨‍🦱",
  "👨‍🦳","👨‍🦲","👩","👩‍🦰","🧑‍🦰","🧑‍🦱","👩‍🦳","🧑‍🦳","👱‍♂️","👴",
  "👵","🧓","👨‍🚀","🥷","👰","👳‍♂️","🤵‍♂️","👸","🫅","🦹‍♀️",
  "🧙‍♂️","🧟‍♂️","🐕","🐶","🐩","🐈","🐈‍⬛","😺","🐃","🐄",
  "🐿","🦫","🦔","🐧","🦭","🐙","🐛","🐸","🦐","🪆",
];

export default function BirthdaysPage() {
  const { birthdays, addBirthday, updateBirthday, removeBirthday } = useEvents();

  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [personEmoji, setPersonEmoji] = useState("👨");
  const [pickerOpen, setPickerOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editMonth, setEditMonth] = useState("");
  const [editDay, setEditDay] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editEmoji, setEditEmoji] = useState("👨");
  const [editPickerOpen, setEditPickerOpen] = useState(false);

  const monthNames = [
    "",
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const filteredBirthdays = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return birthdays.filter((birthday) =>
      normalized.length === 0
        ? true
        : birthday.name.toLowerCase().includes(normalized)
    );
  }, [birthdays, search]);

  const handleAddBirthday = () => {
    const trimmedName = name.trim();
    const numericMonth = Number(month);
    const numericDay = Number(day);
    const numericYear = Number(year);

    if (!trimmedName || !numericMonth || !numericDay || !numericYear) return;
    if (numericMonth < 1 || numericMonth > 12) return;
    if (numericDay < 1 || numericDay > 31) return;
    if (numericYear < 1900 || numericYear > CURRENT_YEAR) return;

    addBirthday(
      trimmedName,
      `${monthNames[numericMonth]} ${numericDay}`,
      numericMonth,
      numericDay,
      numericYear,
      personEmoji
    );

    setName("");
    setMonth("");
    setDay("");
    setYear("");
    setPersonEmoji("👨");
    setPickerOpen(false);
  };

  const startEditing = (birthday: (typeof birthdays)[number]) => {
    setEditingId(birthday.id);
    setEditName(birthday.name);
    setEditMonth(String(birthday.month));
    setEditDay(String(birthday.day));
    setEditYear(String(birthday.year));
    setEditEmoji(birthday.personEmoji);
    setEditPickerOpen(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditMonth("");
    setEditDay("");
    setEditYear("");
    setEditEmoji("👨");
    setEditPickerOpen(false);
  };

  const saveEdit = () => {
    if (editingId === null) return;

    const trimmedName = editName.trim();
    const numericMonth = Number(editMonth);
    const numericDay = Number(editDay);
    const numericYear = Number(editYear);

    if (!trimmedName || !numericMonth || !numericDay || !numericYear) return;
    if (numericMonth < 1 || numericMonth > 12) return;
    if (numericDay < 1 || numericDay > 31) return;
    if (numericYear < 1900 || numericYear > CURRENT_YEAR) return;

    updateBirthday(
      editingId,
      trimmedName,
      numericMonth,
      numericDay,
      numericYear,
      editEmoji
    );

    cancelEditing();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50 px-4 py-5 text-slate-900 sm:p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Birthdays
        </h1>
        <p className="mt-1 text-sm text-slate-700 sm:text-base">
          Keep track of birthdays, ages, and personal emoji markers.
        </p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search birthdays..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-300"
        />
      </div>

      <div className="mb-6 rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="text-xl font-bold text-slate-900">Add Birthday</h2>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dad"
              className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-300"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Person emoji
            </label>

            <button
              type="button"
              onClick={() => setPickerOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-left"
            >
              <span className="text-2xl">{personEmoji}</span>
              <span className="text-sm font-medium text-slate-700">
                {pickerOpen ? "Close emoji picker" : "Choose emoji"}
              </span>
            </button>

            {pickerOpen && (
              <div className="mt-3 rounded-2xl border border-black/10 bg-slate-50 p-3">
                <div className="grid grid-cols-10 gap-2">
                  {birthdayEmojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setPersonEmoji(emoji);
                        setPickerOpen(false);
                      }}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition ${
                        personEmoji === emoji
                          ? "bg-pink-100 ring-2 ring-pink-200"
                          : "bg-white hover:bg-slate-100"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="Month (7)"
              className="rounded-2xl border border-black/10 px-4 py-3 text-sm"
            />
            <input
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="Day (27)"
              className="rounded-2xl border border-black/10 px-4 py-3 text-sm"
            />
          </div>

          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Birth year (1956)"
            className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          />

          <button
            onClick={handleAddBirthday}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Add Birthday
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredBirthdays.length === 0 ? (
          <div className="rounded-[1.6rem] bg-white p-5 text-sm text-slate-500 shadow-sm ring-1 ring-black/5">
            No birthdays match that search.
          </div>
        ) : (
          filteredBirthdays.map((birthday) => {
            const turningAge = CURRENT_YEAR - birthday.year;
            const isEditing = editingId === birthday.id;

            return (
              <div
                key={birthday.id}
                className="rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-black/5"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
                      placeholder="Name"
                    />

                    <div>
                      <button
                        type="button"
                        onClick={() => setEditPickerOpen((prev) => !prev)}
                        className="flex items-center gap-3 rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-left"
                      >
                        <span className="text-2xl">{editEmoji}</span>
                        <span className="text-sm font-medium text-slate-700">
                          {editPickerOpen ? "Close emoji picker" : "Choose emoji"}
                        </span>
                      </button>

                      {editPickerOpen && (
                        <div className="mt-3 rounded-2xl border border-black/10 bg-slate-50 p-3">
                          <div className="grid grid-cols-10 gap-2">
                            {birthdayEmojiOptions.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  setEditEmoji(emoji);
                                  setEditPickerOpen(false);
                                }}
                                className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition ${
                                  editEmoji === emoji
                                    ? "bg-pink-100 ring-2 ring-pink-200"
                                    : "bg-white hover:bg-slate-100"
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <input
                        value={editMonth}
                        onChange={(e) => setEditMonth(e.target.value)}
                        className="rounded-2xl border border-black/10 px-4 py-3 text-sm"
                        placeholder="Month"
                      />
                      <input
                        value={editDay}
                        onChange={(e) => setEditDay(e.target.value)}
                        className="rounded-2xl border border-black/10 px-4 py-3 text-sm"
                        placeholder="Day"
                      />
                      <input
                        value={editYear}
                        onChange={(e) => setEditYear(e.target.value)}
                        className="rounded-2xl border border-black/10 px-4 py-3 text-sm"
                        placeholder="Year"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={saveEdit}
                        className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                        {birthday.personEmoji} {birthday.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-700">{birthday.date}</p>
                      <p className="mt-1 text-sm font-semibold text-pink-600">
                        Turning {turningAge}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => startEditing(birthday)}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeBirthday(birthday.id)}
                        className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}