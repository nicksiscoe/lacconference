"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.scss";
import { ScheduleData } from "./types";

interface SheetData {
  data: ScheduleData[][];
  currentWeekIndex: number;
}

interface TeamRecord {
  team: string;
  wins: number;
  losses: number;
}

export default function Home() {
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [standings, setStandings] = useState<TeamRecord[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/schedule");
        const data = await response.json();
        setSheetData(data);
        calculateStandings(data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  const calculateStandings = (data: ScheduleData[][]) => {
    const teamRecords: { [key: string]: TeamRecord } = {};

    // Initialize team records
    data.slice(1).forEach((row) => {
      const team = row[1]?.value; // Team name is in the second column
      if (team) {
        teamRecords[team] = { team, wins: 0, losses: 0 };
      }
    });

    // Count wins and losses
    data.slice(1).forEach((row) => {
      row.slice(2).forEach((cell) => {
        if (cell.value && cell.played) {
          const team = row[1].value;
          if (!team) return;
          if (cell.won) {
            teamRecords[team].wins++;
          } else {
            teamRecords[team].losses++;
          }
        }
      });
    });

    const sortedStandings = Object.values(teamRecords).sort(
      (a, b) => b.wins - a.wins || a.losses - b.losses
    );
    setStandings(sortedStandings);
  };

  if (!sheetData) return <div>Loading...</div>;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Leahood Athletic Conference</h1>

        <h2>Standings</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Team</th>
                <th>Wins</th>
                <th>Losses</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((record, index) => (
                <tr key={index}>
                  <td>{record.team}</td>
                  <td>{record.wins}</td>
                  <td>{record.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Schedule</h2>
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
