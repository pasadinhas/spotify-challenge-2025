import React, { useEffect, useState } from "react";
import "./App.css";
import { Schedule, today } from "./scheduler/Schedule";

function App() {
  const startDate = new Date(2025, 0, 1);
  const endDate = new Date(2026, 0, 1);

  const schedule = [];
  for (
    let date = startDate, i = 0;
    date < endDate;
    date.setDate(date.getDate() + 1)
  ) {
    schedule.push(`${date.toDateString()} => ${Schedule[i++].description}`);
  }

  const rule = today();
  const similarRules = Schedule.filter((r) => r.rule === rule.rule);

  return (
    <div className="min-w-full min-h-full flex flex-col content-center justify-center pt-20">
      <h1 className="mb-20 text-5xl font-extrabold text-center">
        {new Date().toDateString()}
      </h1>
      <h3 className="mb-10 text-3xl font-bold text-center">{rule.rule}</h3>
      <p className="text-center">{rule.description}</p>
      <div className="flex min-w-full mt-20 px-50 justify-around">
        {similarRules.map((r) => (
          <div>
            <h5 className="mb-10 text-xl font-bold text-center">
              {r.date.toDateString()}
            </h5>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
