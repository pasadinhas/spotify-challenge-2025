import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  playlistTracks: SpotifyApi.PlaylistTrackObject[] | undefined;
}

export default function RulePicker({
  setDay,
  setMonth,
  playlistTracks,
}: RulePickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search results
  const closeSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        closeSearch();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeSearch]);

  // Handle ESC key to close search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSearch]);

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

  // Build a reverse mapping from playlist index to date
  const playlistIndexToDate = useMemo(() => {
    const map = new Map<number, Date>();
    const startDate = new Date(2025, 0, 1); // Jan 1, 2025
    const endDate = new Date(2025, 11, 31); // Dec 31, 2025
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const indices = Schedule.on(currentDate).playlistIndices;
      indices.forEach((idx) => {
        if (!map.has(idx)) {
          map.set(idx, new Date(currentDate));
        }
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return map;
  }, []);

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

  // Filter tracks based on debounced search query, keeping original index
  const filteredTracks = useMemo(() => {
    if (!playlistTracks || debouncedSearchQuery.trim() === "") return [];
    return playlistTracks
      .map((pt, idx) => ({ pt, idx }))
      .filter(({ pt }) => {
        if (!pt.track || !pt.track.name) return false;
        const nameMatch = pt.track.name
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase());
        const artistMatch =
          pt.track.artists &&
          pt.track.artists.some((a) =>
            a.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
          );
        return nameMatch || artistMatch;
      });
  }, [debouncedSearchQuery, playlistTracks]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectRule = useCallback(
    (rule: RuleItem) => {
      const appearance = ruleAppearanceMap.get(rule.rule);

      if (appearance?.hasAppeared && appearance.firstOccurrence) {
        setMonth(appearance.firstOccurrence.getMonth());
        setDay(appearance.firstOccurrence.getDate());
        closeSearch();
      }
    },
    [ruleAppearanceMap, setMonth, setDay, closeSearch]
  );

  // Handle selecting a track: jump to the day it was used
  const handleSelectTrack = useCallback(
    (playlistIndex: number) => {
      const date = playlistIndexToDate.get(playlistIndex);
      if (date) {
        setMonth(date.getMonth());
        setDay(date.getDate());
        closeSearch();
      }
    },
    [playlistIndexToDate, setMonth, setDay, closeSearch]
  );

  return (
    <div className="mt-10 px-5 max-w-2xl mx-auto w-full">
      <div className="mb-6 relative" ref={searchContainerRef}>
        {searchQuery.trim() !== "" && (
          <div className="absolute bottom-full mb-2 w-full bg-gray-800 rounded-md max-h-96 overflow-y-auto shadow-lg z-10">
            {/* Rule results */}
            {filteredRules.length > 0 && (
              <>
                <div className="px-4 pt-4 pb-2 text-xs text-gray-400 uppercase tracking-wider">
                  Rules
                </div>
                <ul className="divide-y divide-gray-700">
                  {filteredRules.map((rule, index) => {
                    const appearance = ruleAppearanceMap.get(rule.rule);
                    const hasAppeared = appearance?.hasAppeared ?? false;

                    return (
                      <li
                        key={"rule-" + index}
                        className={`p-3 transition-colors ${
                          hasAppeared
                            ? "hover:bg-gray-700 cursor-pointer"
                            : "cursor-not-allowed"
                        }`}
                        onClick={() => handleSelectRule(rule)}
                      >
                        <div className="font-medium text-white">
                          {rule.rule}
                        </div>
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
              </>
            )}

            {/* Song results */}
            {filteredTracks.length > 0 && (
              <>
                <div className="px-4 pt-4 pb-2 text-xs text-gray-400 uppercase tracking-wider">
                  Songs
                </div>
                <ul className="divide-y divide-gray-700">
                  {filteredTracks.map(({ pt, idx }) =>
                    pt.track ? (
                      <li
                        key={"track-" + idx}
                        className="p-3 transition-colors hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleSelectTrack(idx)}
                      >
                        <div className="font-medium text-white">
                          {pt.track.name}
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                          {pt.track.artists &&
                            pt.track.artists.map((a) => a.name).join(", ")}
                        </div>
                      </li>
                    ) : null
                  )}
                </ul>
              </>
            )}

            {/* No results */}
            {filteredRules.length === 0 && filteredTracks.length === 0 && (
              <div className="p-4 text-center text-gray-400">
                No rules or songs found matching your search.
              </div>
            )}
          </div>
        )}

        <input
          type="text"
          placeholder="Search for a rule or song..."
          className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:border-red-500"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
    </div>
  );
}
