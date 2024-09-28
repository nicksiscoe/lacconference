"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.scss";

interface SheetData {
  data: string[][];
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
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheetData.data.slice(1).map((row, rowIndex) => {
                return (
                  <tr key={rowIndex}>
                    {sheetData.data[0].map((_, cellIndex) => {
                      const cell = row[cellIndex];
                      return cellIndex < 2 ? (
                        <th key={cellIndex} className={styles.stickyColumn}>
                          {cell}
                        </th>
                      ) : (
                        <td
                          key={cellIndex}
                          className={`${
                            !cell?.trim() ? styles.emptyCell : ""
                          } ${
                            cellIndex === sheetData.currentWeekIndex
                              ? styles.currentWeek
                              : ""
                          }`}
                        >
                          {cell}
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
