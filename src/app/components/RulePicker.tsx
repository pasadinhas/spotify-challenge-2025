import { useState, useEffect } from "react";
import regRules from "../../data/rules.json";
import sharedRules from "../../data/shared_rules.json";
import Schedule from "../scheduler/Schedule";
import Time from "../scheduler/Time";

interface RuleItem {
  rule: string;
  description: string;
  notes: string | null;
  date?: string;
}

interface RulePickerProps {
  setDay: (day: number) => void;
  setMonth: (month: number) => void;
}

export default function RulePicker({ setDay, setMonth }: RulePickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [filteredRules, setFilteredRules] = useState<RuleItem[]>([]);
  const [selectedRule, setSelectedRule] = useState<RuleItem | null>(null);
  const [navigationMessage, setNavigationMessage] = useState<string | null>(
    null
  );

  // Load and combine rules from both sources on component mount
  useEffect(() => {
    // Convert shared rules format to match regular rules
    const formattedSharedRules = sharedRules.map((rule) => ({
      rule: rule.rule,
      description: rule.description,
      notes: rule.notes,
      date: rule.date,
    }));

    // Combine both rule sets
    const allRules = [...regRules, ...formattedSharedRules];
    setRules(allRules);
    setFilteredRules(allRules);
  }, []);

  // Filter rules based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRules(rules);
    } else {
      const filtered = rules.filter(
        (rule) =>
          rule.rule.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rule.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRules(filtered);
    }
  }, [searchQuery, rules]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectRule = (rule: RuleItem) => {
    setSelectedRule(rule);
    setNavigationMessage(null);

    // Check when this rule first appears in the schedule
    const startDate = new Date(2025, 0, 1); // Jan 1, 2025
    const today = Time.debugMode ? new Date(2025, 11, 31) : new Date(); // Use end of year in debug mode

    // Find the first occurrence of this rule
    let firstOccurrence: Date | null = null;

    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      const daySchedule = Schedule.on(currentDate);
      if (daySchedule.rule.rule === rule.rule) {
        firstOccurrence = new Date(currentDate);
        break;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (firstOccurrence) {
      // We found an occurrence on or before today
      setMonth(firstOccurrence.getMonth());
      setDay(firstOccurrence.getDate());
      setNavigationMessage(
        `This rule first appeared on ${firstOccurrence.toLocaleDateString(
          "default",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
          }
        )}`
      );
    } else {
      setNavigationMessage("This rule hasn't appeared yet.");
    }
  };

  return (
    <div className="mt-10 px-5 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for a rule..."
          className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:border-red-500"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {navigationMessage && (
        <div className="mb-6 p-4 bg-gray-800 rounded-md text-white">
          {navigationMessage}
        </div>
      )}

      {selectedRule && (
        <div className="mb-6 p-4 bg-red-700 rounded-md">
          <h3 className="text-xl font-bold">{selectedRule.rule}</h3>
          <p className="mt-2">{selectedRule.description}</p>
          {selectedRule.notes && (
            <p className="mt-2 italic">{selectedRule.notes}</p>
          )}
          {selectedRule.date && (
            <p className="mt-2 text-sm">Date: {selectedRule.date}</p>
          )}
        </div>
      )}

      <div className="bg-gray-800 rounded-md max-h-96 overflow-y-auto">
        {filteredRules.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {filteredRules.map((rule, index) => (
              <li
                key={index}
                className="p-3 hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => handleSelectRule(rule)}
              >
                <div className="font-medium text-white">{rule.rule}</div>
                <div className="text-sm text-gray-300 mt-1">
                  {rule.description}
                </div>
                {rule.date && (
                  <div className="text-xs text-gray-400 mt-1">
                    Date: {rule.date}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-400">
            No rules found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
