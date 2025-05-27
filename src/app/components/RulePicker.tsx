import { useState, useEffect, useMemo, useCallback } from "react";
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Memoize the combined rules
  const rules = useMemo(() => {
    // Convert shared rules format to match regular rules
    const formattedSharedRules = sharedRules.map((rule) => ({
      rule: rule.rule,
      description: rule.description,
      notes: rule.notes,
      date: rule.date,
    }));

    // Convert regular rules to include optional date property
    const formattedRegRules = regRules.map((rule) => ({
      rule: rule.rule,
      description: rule.description,
      notes: rule.notes,
      date: undefined as string | undefined,
    }));

    // Combine both rule sets
    return [...formattedRegRules, ...formattedSharedRules];
  }, []);

  // Memoize rule appearance status for all rules
  const ruleAppearanceMap = useMemo(() => {
    const map = new Map<
      string,
      { hasAppeared: boolean; firstOccurrence: Date | null }
    >();

    const startDate = new Date(2025, 0, 1); // Jan 1, 2025
    const today = Time.debugMode ? new Date(2025, 11, 31) : new Date();

    rules.forEach((rule) => {
      let currentDate = new Date(startDate);
      let hasAppeared = false;
      let firstOccurrence: Date | null = null;

      while (currentDate <= today && !hasAppeared) {
        const daySchedule = Schedule.on(currentDate);
        if (daySchedule.rule.rule === rule.rule) {
          hasAppeared = true;
          firstOccurrence = new Date(currentDate);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      map.set(rule.rule, { hasAppeared, firstOccurrence });
    });

    return map;
  }, [rules]);

  // Filter rules based on debounced search query
  const filteredRules = useMemo(() => {
    if (debouncedSearchQuery.trim() === "") {
      return []; // Show nothing when search is empty
    }

    return rules.filter(
      (rule) =>
        rule.rule.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        rule.description
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase())
    );
  }, [debouncedSearchQuery, rules]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectRule = useCallback(
    (rule: RuleItem) => {
      const appearance = ruleAppearanceMap.get(rule.rule);

      if (appearance?.hasAppeared && appearance.firstOccurrence) {
        setMonth(appearance.firstOccurrence.getMonth());
        setDay(appearance.firstOccurrence.getDate());
        setSearchQuery("");
      }
    },
    [ruleAppearanceMap, setMonth, setDay]
  );

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

      {searchQuery.trim() !== "" && (
        <div className="bg-gray-800 rounded-md max-h-96 overflow-y-auto">
          {filteredRules.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {filteredRules.map((rule, index) => {
                const appearance = ruleAppearanceMap.get(rule.rule);
                const hasAppeared = appearance?.hasAppeared ?? false;

                return (
                  <li
                    key={index}
                    className={`p-3 transition-colors ${
                      hasAppeared
                        ? "hover:bg-gray-700 cursor-pointer"
                        : "cursor-not-allowed"
                    }`}
                    onClick={() => handleSelectRule(rule)}
                  >
                    <div className="font-medium text-white">{rule.rule}</div>
                    <div className="text-sm text-gray-300 mt-1">
                      {rule.description}
                    </div>
                    {!hasAppeared && (
                      <div className="text-sm text-red-500 mt-1">
                        This rule has not appeared yet.
                      </div>
                    )}
                    {rule.date && (
                      <div className="text-xs text-gray-400 mt-1">
                        Date: {rule.date}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-400">
              No rules found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
