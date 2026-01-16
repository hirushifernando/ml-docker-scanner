

import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {/* NAVBAR */}
        <Navbar />

        {/* MAIN CONTENT */}
        <main className="pt-[10px]"> {/* Add padding so navbar doesn't cover content */}
          {children}
        </main>
      </body>
    </html>
  );
}

