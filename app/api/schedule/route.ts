import { ScheduleData } from "@/app/types";
import { NextResponse } from "next/server";

const SHEET_ID = process.env.SCHEDULE_SHEET_ID!;
const SHEET_NAME = "SCHEDULE";
const API_KEY = process.env.GOOGLE_API_KEY!;

export const revalidate = 0;

const WHITE_CELL_COLOR = JSON.stringify({
  red: 1,
  green: 1,
  blue: 1,
});
const WON_GREEN_COLOR = JSON.stringify({
  red: 0.8509804,
  green: 0.91764706,
  blue: 0.827451,
});

type CellColor = {
  red: number;
  green: number;
  blue: number;
};
type CellBorder = {
  style: "SOLID";
  width: number;
  color: CellColor;
  colorStyle: {
    rgbColor: CellColor;
  };
};

interface Cell {
  userEnteredValue?: {
    stringValue: string;
  };
  effectiveValue?: {
    stringValue: string;
  };
  formattedValue?: string;
  userEnteredFormat: {
    backgroundColor?: CellColor;
    borders?: {
      top?: CellBorder;
      bottom?: CellBorder;
      right?: CellBorder;
      left?: CellBorder;
    };
    horizontalAlignment?: "LEFT" | "CENTER" | "RIGHT";
    textFormat?: {
      bold: boolean;
      fontFamily?: string;
      fontSize?: number;
      foregroundColor?: CellColor;
    };
    backgroundColorStyle?: {
      rgbColor: CellColor;
    };
  };
}

export async function GET() {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?ranges=${SHEET_NAME}&key=${API_KEY}&fields=sheets.data.rowData.values(userEnteredValue,effectiveValue,formattedValue,userEnteredFormat)`
    );
    const result = await response.json();

    const data = result.sheets[0].data[0].rowData.map(
      (row: { values: Cell[] }) =>
        row.values?.map((cell: Cell) => {
          const played =
            !!cell.userEnteredFormat?.backgroundColor &&
            JSON.stringify(cell.userEnteredFormat.backgroundColor) !==
              WHITE_CELL_COLOR;
          const won =
            played &&
            JSON.stringify(cell.userEnteredFormat.backgroundColor || {}) ===
              WON_GREEN_COLOR;
          return {
            value: cell.formattedValue,
            backgroundColor: cell.userEnteredFormat?.backgroundColor,
            played,
            won,
          } as ScheduleData;
        }) || []
    );

    // Find the current week
    const today = new Date();
    const weekIndex = data[1].findIndex((cell: ScheduleData) => {
      if (!cell.value) return false;
      const cellDate = new Date(
        new Date(cell.value).setFullYear(new Date().getFullYear())
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
