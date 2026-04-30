const ICS_URL =
  "https://calendar.google.com/calendar/ical/c_92899981827246bf292bfb0f95ac7d527bcb9015805514b2f68d3153d8757aca%40group.calendar.google.com/public/basic.ics";

const FIREWORKS_DATES_2026 = new Set([
  "5-15", "5-16", "5-29", "5-30",
  "6-11", "6-12", "6-13", "6-19", "6-20", "6-25",
  "7-3", "7-4", "7-10", "7-11", "7-30", "7-31",
  "8-1", "8-6", "8-13", "8-21", "8-22",
  "9-4", "9-5", "9-6",
]);

function parseICS(content) {
  return content
    .split("BEGIN:VEVENT")
    .slice(1)
    .map((event) => {
      const get = (key) => {
        const match = event.match(new RegExp(`${key}[^:]*:(.*)`));
        return match ? match[1].trim() : "";
      };

      return {
        start: get("DTSTART"),
        summary: get("SUMMARY"),
      };
    })
    .filter((event) => event.start && event.summary);
}

function convertICSDate(dtstart) {
  const year = Number(dtstart.slice(0, 4));
  const month = Number(dtstart.slice(4, 6));
  const day = Number(dtstart.slice(6, 8));
  const date = new Date(year, month - 1, day);

  return {
    year,
    month,
    day,
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
  };
}

function buildEvent(type, date) {
  const isThirsty = type === "thirsty";

  return {
    category: "Sports",
    title: isThirsty
      ? "Kane County Cougars Thirsty Thursday"
      : "Kane County Cougars Fireworks Night",
    details: `${date.weekday} · Cougars Game · Geneva, IL`,
    icon: isThirsty ? "🍻" : "💥",
    month: date.month,
    day: date.day,
    weekday: date.weekday,
    scheduleType: "schedule_driven",
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}

async function main() {
  const response = await fetch(ICS_URL);

  if (!response.ok) {
    throw new Error(`ICS fetch failed: ${response.status}`);
  }

  const icsText = await response.text();

  const games = parseICS(icsText).map((game) => ({
    ...game,
    date: convertICSDate(game.start),
  }));

  const events = [];

  for (const game of games) {
    const key = `${game.date.month}-${game.date.day}`;

    const isThirstyThursday =
      game.date.weekday === "Thu" &&
      game.date.month >= 6 &&
      game.date.month <= 8;

    if (isThirstyThursday) {
      events.push(buildEvent("thirsty", game.date));
    }

    if (FIREWORKS_DATES_2026.has(key)) {
      events.push(buildEvent("fireworks", game.date));
    }
  }

  events.sort(
    (a, b) => a.month - b.month || a.day - b.day || a.title.localeCompare(b.title)
  );

  console.log(
    JSON.stringify(
      {
        sourceName: "KC Cougars Promotions + Schedule",
        sourceUrl: "https://www.kccougars.com/promotions",
        events,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Parser failed:", error);
  process.exit(1);
});
