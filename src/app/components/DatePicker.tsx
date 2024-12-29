import Time from "../scheduler/Time";

interface DatePickerProps {
  day: number;
  month: number;
  setDay: (day: number) => void;
  setMonth: (month: number) => void;
}

export default function DatePicker({
  day,
  month,
  setDay,
  setMonth,
}: DatePickerProps) {
  return (
    <div className="flex min-w-full mt-20 px-5 gap-8 justify-around">
      <select
        className="bg-white
          text-gray-900
            border
          border-gray-300
            rounded-md
            shadow-sm
            p-2
            w-2/3
            max-w-lg"
        id="month"
        value={month}
        onChange={(e) => setMonth(Number(e.target.value))}
      >
        {Time.months().map((month, i) => (
          <option key={i} value={i}>{month}</option>
        ))}
      </select>
      <select
        className="bg-white
          text-gray-900  
            border
          border-gray-300
            rounded-md
            shadow-sm
            p-2
            w-1/3
            max-w-md"
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
    </div>
  );
}
