const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Time = {
  debugMode: false,

  now(): Date {
    return new Date();
  },

  isFuture(date: Date) {
    return !this.debugMode && date > this.now();
  },

  getDayOfYear(date: Date): number {
    // Get the year, month, and day of the given date
    const month = date.getMonth(); // 0-based month index (0 = January)
    const day = date.getDate();

    // Sum the days in all the previous months of the given year
    let dayOfYear = DAYS_IN_MONTH
      .slice(0, month)
      .reduce((acc, days) => acc + days, 0);

    // Add the days of the current month
    dayOfYear += day - 1;

    return dayOfYear;
  },

  month(index: number) {
    return MONTHS[index] || "<invalid>"
  },

  months() {
    return MONTHS;
  },

  daysInMonth(index: number) {
    return DAYS_IN_MONTH[index] || 0
  }
};

export default Time;
