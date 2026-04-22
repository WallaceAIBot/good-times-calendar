import type { Metadata } from "next";
import "./globals.css";
import { EventsProvider } from "./events-context";
import BottomNav from "./bottom-nav";

export const metadata: Metadata = {
  title: "Good Times Calendar",
  description: "Plan more fun together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50">
        <EventsProvider>
          <div className="pb-32">{children}</div>
          <BottomNav />
        </EventsProvider>
      </body>
    </html>
  );
}