import Time from "../scheduler/Time";

interface DatePickerProps {
  day: number;
  month: number;
  setDay: (day: number) => void;
  setMonth: (month: number) => void;
}

function DropdownArrow() {
  return (
    <svg
      className="w-4 h-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export default function DatePicker({
  day,
  month,
  setDay,
  setMonth,
}: DatePickerProps) {
  return (
    <div className="flex min-w-full mt-20 px-5 gap-8 justify-around">
      <div className="relative w-2/3 max-w-lg">
        <select
          className="appearance-none p-3 pr-16 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:border-red-500 w-full"
          id="month"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {Time.months().map((month, i) => (
            <option key={i} value={i}>
              {month}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <DropdownArrow />
        </div>
      </div>
      <div className="relative w-1/3 max-w-md">
        <select
          className="appearance-none p-3 pr-16 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:border-red-500 w-full"
          id="day"
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
        >
          {Array(Time.daysInMonth(month))
            .fill(0)
            .map((_, day) => (
              <option key={day}>{day + 1}</option>
            ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <DropdownArrow />
        </div>
      </div>
    </div>
  );
}
