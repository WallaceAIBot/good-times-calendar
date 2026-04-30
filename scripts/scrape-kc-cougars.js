const { chromium } = require("playwright");

const SOURCE_URL = "https://www.kccougars.com/schedule";

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseDateFromText(text) {
  const match = text.match(
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})\b/i
  );

  if (!match) return null;

  const monthMap = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    sept: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  };

  const month = monthMap[match[1].toLowerCase().replace(".", "")];
  const day = Number(match[2]);

  if (!month || !day) return null;

  const date = new Date(2026, month - 1, day);
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });

  return { month, day, weekday };
}

function buildEvent({ promoType, dateInfo, rawText }) {
  const isThirsty = promoType === "thirsty";
  const icon = isThirsty ? "🍻" : "💥";
  const title = isThirsty
    ? "Kane County Cougars Thirsty Thursday"
    : "Kane County Cougars Fireworks Night";

  return {
    category: "Sports",
    title,
    details: `${dateInfo.weekday} · Kane County Cougars · Geneva, IL`,
    badge: "Local",
    icon,
    featured: true,
    month: dateInfo.month,
    day: dateInfo.day,
    weekday: dateInfo.weekday,
    scheduleType: "schedule_driven",
    lastUpdated: new Date().toISOString().slice(0, 10),
    rawText,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(SOURCE_URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);

  const bodyText = cleanText(await page.locator("body").innerText());

  const chunks = bodyText
    .split(/(?=(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b)/i)
    .map(cleanText)
    .filter(Boolean);

  const events = [];

  for (const chunk of chunks) {
    const hasBeer = chunk.includes("🍺") || chunk.includes("🍻");
    const hasExplosion = chunk.includes("💥") || chunk.includes("🎆") || chunk.includes("🎇");

    if (!hasBeer && !hasExplosion) continue;

    const dateInfo = parseDateFromText(chunk);
    if (!dateInfo) continue;

    if (hasBeer) {
      events.push(buildEvent({ promoType: "thirsty", dateInfo, rawText: chunk }));
    }

    if (hasExplosion) {
      events.push(buildEvent({ promoType: "fireworks", dateInfo, rawText: chunk }));
    }
  }

  const deduped = Array.from(
    new Map(events.map((event) => [`${event.title}-${event.month}-${event.day}`, event])).values()
  ).map(({ rawText, ...event }) => event);

  const output = {
    sourceName: "Kane County Cougars Schedule",
    sourceUrl: SOURCE_URL,
    events: deduped,
  };

  console.log(JSON.stringify(output, null, 2));

  await browser.close();
}

main().catch((error) => {
  console.error("Scraper failed:", error);
  process.exit(1);
});
