import React, { useEffect, useState } from "react";
import "./App.css";
import Schedule from "./scheduler/scheduler"; 

function App() {
  const startDate = new Date(2025, 0, 1);
  const endDate = new Date(2026, 0, 1);
  
  const schedule = []
  for (let date = startDate, i = 0; date < endDate; date.setDate(date.getDate() + 1)) {
      schedule.push(`${date.toDateString()} => ${Schedule[i++].description}`);
  }

  return (
    <div className="App">
      <h1>Hello</h1>
      <br />
      <pre>{schedule.join("\n")}</pre>
    </div>
  );
}

export default App;
