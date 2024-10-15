import { NextResponse } from "next/server";

const SHEET_ID = process.env.SCHEDULE_SHEET_ID!;
const SHEET_NAME = "SCHEDULE";
const API_KEY = process.env.GOOGLE_API_KEY!;

export const revalidate = 60 * 60 * 24; // 1 day

export async function GET() {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`
    );
    const result = await response.json();
    const data = result.values || [];

    // Find the current week
    const today = new Date();
    const weekIndex = result.values[1].findIndex((date: string) => {
      if (!date) return false;
      const cellDate = new Date(
        new Date(date).setFullYear(new Date().getFullYear())
      );
      const nextSunday = new Date(today);
      nextSunday.setDate(today.getDate() + (7 - today.getDay()));
      const followingSunday = new Date(nextSunday);
      followingSunday.setDate(nextSunday.getDate() + 7);
      return cellDate > nextSunday && cellDate <= followingSunday;
    });

    return NextResponse.json({
      data,
      currentWeekIndex: weekIndex > 0 ? weekIndex - 1 : -1,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
