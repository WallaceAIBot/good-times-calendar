const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.kccougars.com/schedule", {
    waitUntil: "networkidle",
    timeout: 60000,
  });

  await page.waitForTimeout(5000);

  const data = await page.evaluate(() => {
    return {
      title: document.title,
      textSample: document.body.innerText.slice(0, 5000),
      links: Array.from(document.querySelectorAll("a")).map((a) => ({
        text: a.innerText,
        href: a.href,
      })),
      images: Array.from(document.querySelectorAll("img")).map((img) => ({
        alt: img.alt,
        src: img.src,
        title: img.title,
      })),
      scripts: Array.from(document.querySelectorAll("script"))
        .map((s) => s.src || s.innerText.slice(0, 300))
        .filter(Boolean),
    };
  });

  console.log(JSON.stringify(data, null, 2));

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
