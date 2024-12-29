import Time from "../scheduler/Time";
import { ScheduleDay } from "../scheduler/types";

export default function SelectedRule({
  scheduledDay,
}: {
  scheduledDay: ScheduleDay;
}) {
  const date = scheduledDay.date;
  return (
    <div className="bg-red-600 py-5">
      <h1 className="mb-20 text-5xl font-extrabold text-center">
        {date.toLocaleDateString("default", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </h1>
      <h2 className="mb-10 text-3xl font-bold text-center">
        {Time.isFuture(date)
          ? "Come back on this day to see the rule"
          : scheduledDay.rule.rule}
      </h2>
      <p className="text-center mb-5">
        {Time.isFuture(date) ? "" : scheduledDay.rule.description}
      </p>
      {scheduledDay.rule.notes && (
        <p className="text-center mb-5">
          {Time.isFuture(date) ? "???" : scheduledDay.rule.notes}
        </p>
      )}
    </div>
  );
}
