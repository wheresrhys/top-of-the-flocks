import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "Top of the Flocks",
  description: "Leaderboard for bird ringing data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
