"use client";

import "./globals.css";
import Navbar from "@/components/Navbar";
import { ReactNode, createContext, useContext, useState } from "react";

// ================= ALERT CONTEXT =================
type AlertContextType = {
  unseenAlerts: number;
  setUnseenAlerts: (count: number) => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [unseenAlerts, setUnseenAlerts] = useState(0);

  return (
    <AlertContext.Provider value={{ unseenAlerts, setUnseenAlerts }}>
      {children}
    </AlertContext.Provider>
  );
}

// Custom hook to use alert context
export function useAlertContext() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlertContext must be used inside AlertProvider");
  return ctx;
}

// ================= ROOT LAYOUT =================
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {/* Wrap everything with AlertProvider so alert state is global */}
        <AlertProvider>
          {/* NAVBAR (can also consume unseenAlerts) */}
          <Navbar />

          {/* MAIN CONTENT */}
          <main className="pt-[10px]">
            {children}
          </main>
        </AlertProvider>
      </body>
    </html>
  );
}
