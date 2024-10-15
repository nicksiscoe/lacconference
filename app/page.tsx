"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.scss";
import { ScheduleData } from "./types";

interface SheetData {
  data: ScheduleData[][];
  currentWeekIndex: number;
}

export default function Home() {
  const [sheetData, setSheetData] = useState<SheetData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/schedule");
        const data = await response.json();
        setSheetData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  if (!sheetData) return <div>Loading...</div>;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Leahood Athletic Conference</h1>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                {sheetData.data[0]?.map((header, index) => (
                  <th
                    key={index}
                    className={`${
                      index === sheetData.currentWeekIndex
                        ? styles.currentWeek
                        : ""
                    }`}
                  >
                    {header.value}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheetData.data.slice(1).map((row, rowIndex) => {
                return (
                  <tr key={rowIndex}>
                    {sheetData.data[0].map((_, cellIndex) => {
                      const cell = row.at(cellIndex);
                      if (!cell) return null;
                      return cellIndex < 2 ? (
                        <th key={cellIndex} className={styles.stickyColumn}>
                          {cell.value}
                        </th>
                      ) : (
                        <td
                          key={cellIndex}
                          className={`${
                            !cell.value?.trim() ? styles.emptyCell : ""
                          } ${
                            cellIndex === sheetData.currentWeekIndex
                              ? styles.currentWeek
                              : ""
                          }`}
                          style={{
                            backgroundColor: cell.played
                              ? `rgb(${cell.backgroundColor.red * 255}, ${
                                  cell.backgroundColor.green * 255
                                }, ${cell.backgroundColor.blue * 255})`
                              : undefined,
                            color: cell.played ? "black" : "white",
                            fontWeight: cell.played ? "bold" : "normal",
                          }}
                        >
                          {cell.value}
                          {cell.played ? (cell.won ? " (W)" : " (L)") : ""}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
