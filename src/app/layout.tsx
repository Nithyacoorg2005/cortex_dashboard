import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Cortex | MemoryOps",
  description: "Persistent cognitive memory for autonomous operations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#0a0a0a", color: "#ffffff" }}>
        {children}
      </body>
    </html>
  );
}