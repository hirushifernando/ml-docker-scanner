"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAlertContext } from "@/app/layout";
import { getOverviewData } from "../app/dashboard/services/overviewService";

export default function Navbar() {
  const pathname = usePathname();
 const { unseenAlerts, setUnseenAlerts } = useAlertContext();

  // Fetch unseen alerts count
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getOverviewData();
        setUnseenAlerts(data.unseen_alerts || 0);
      } catch (err) {
        console.error("Failed to fetch unseen alerts", err);
      }
    };

    fetchAlerts();
    // Optional: refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [setUnseenAlerts]);

  const navItems = [
    { label: "Dashboard", href: "/dashboard/overview" },
    { label: "Scan Result", href: "/dashboard" },
    { label: "Reports", href: "/dashboard/reports" },
    { label: "Settings", href: "/dashboard/settings" },
  ];

  return (
  <nav className="sticky top-0 z-50 w-full h-[100px] 
  bg-gradient-to-r from-[#02092d] via-[#021041] to-[#052048] 
  text-white shadow-lg">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* ================= LEFT: LOGO ================= */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo3.png"
            alt="DevOps Security"
            width={60}
            height={50}
            className="object-contain"
          />
          <h1 className="text-xl font-bold flex items-center gap-1">
            {/* Iron: gray/black/white gradient */}
            <span className="bg-gradient-to-r from-gray-400 via-gray-800 to-white bg-clip-text text-transparent">
              Iron
            </span>

            {/* Gate: light blue/dark blue gradient */}
            <span className="bg-gradient-to-r from-blue-300 to-blue-700 bg-clip-text text-transparent">
              Gate
            </span>
          </h1>
        </div>

        {/* ================= CENTER: MENU ================= */}
        <div className="hidden md:flex items-center gap-8 text-md font-semibold-uppercase">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={pathname === item.href}
            />
          ))}
        </div>

        {/* ================= RIGHT: PROFILE ================= */}
        <div className="flex items-center gap-5">
           {/* Notification Bell */}
          <button className="relative hover:text-blue-400 transition">
            <Bell size={23} />
            {unseenAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
                {unseenAlerts}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 cursor-pointer hover:text-blue-400 transition">
            <Image
              src="/avatar.png"
              alt="Profile"
              width={35}
              height={34}
              className="rounded-full object-cover"
            />
            <span className="text-base select-none">John Doe</span>
            <ChevronDown size={22} />
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ================= SUB COMPONENT: NAVLINK ================= */
interface NavLinkProps {
  href: string;
  label: string;
  active?: boolean;
}

function NavLink({ href, label, active = false }: NavLinkProps) {
  return (
     <Link
      href={href}
      className={`pb-1 transition border-b-3 font-semibold uppercase text-md ${
        active
          ? "border-blue-400 text-gray-400" // Active: underline blue, text light gray
          : "border-transparent hover:border-blue-400 hover:text-white" // Hover: underline blue, text white
      }`}
    >
      {label}
    </Link>
  );
}

