"use client";

import { useEffect, useState } from "react";
import Data from "../../data/quiz.json";
import Image from "next/image";

type Answer = {
  locked: Boolean;
  selected: { [trackId: string]: string };
};

type Track = {
  added_at: string;
  added_by: string;
  uri: string;
};

const LOCAL_STORAGE_ANSWERS_KEY = "spotify-2025-challenge-quiz.answers";
const DEFAULT_ANSWERS = Data.map(
  () =>
    ({
      locked: false,
      selected: {},
    } as Answer)
);
const OPTIONS = ["Carlos", "Daniel", "Miguel"]

export default function Page() {
  const [currentRule, setCurrentRuleBase] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(DEFAULT_ANSWERS);
  const [blurRuleName, setBlurRuleName] = useState(true);
  const [blurRuleDesc, setBlurRuleDesc] = useState(true);

  const setCurrentRule = (i: number) => {
    setCurrentRuleBase(i);
    setBlurRuleName(true);
    setBlurRuleDesc(true);
  }

  useEffect(() => {
    try {
      const locallySavedAnswers = localStorage.getItem(
        LOCAL_STORAGE_ANSWERS_KEY
      );
      if (locallySavedAnswers) {
        setAnswers(JSON.parse(locallySavedAnswers));
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
  }, []);

  function setAndSaveAnswers(answers: Answer[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_ANSWERS_KEY, JSON.stringify(answers));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
    setAnswers({ ...answers });
  }

  const setAnswerForCurrentRuleTrack = (answer: string, track: Track) => {
    if (answers[currentRule].locked) {
      console.debug(
        "Cannot change answers because they have already been submitted for: " +
          currentRule
      );
      return;
    }
    Object.keys(answers[currentRule].selected).forEach((trackId) => {
      if (answers[currentRule].selected[trackId] == answer) {
        delete answers[currentRule].selected[trackId];
      }
    });
    answers[currentRule].selected[track.uri] = answer;
    setAndSaveAnswers(answers);
  };

  const tracks = Data[currentRule].tracks;

  const stats: Stats = computeStats(Data, answers, OPTIONS);

  function guess() {
    const numberOfAnswers = Object.values(answers[currentRule].selected).filter(
      Boolean
    ).length;
    if (numberOfAnswers < OPTIONS.length) {
      alert("Oops, you didn't select answers for all tracks.");
      return;
    }
    answers[currentRule].locked = true;
    setAndSaveAnswers(answers);
  }

  return (
    <>
      <header className="grid justify-center p-5 pt-10 lg:p-5">
        <Progress
          currentRule={currentRule}
          setCurrentRule={setCurrentRule}
          stats={stats}
        />
      </header>
      <main className="flex flex-col p-5 pb-10 lg:p-10 gap-10">
        <div className="grid align-center place-items-center gap-2">
          <span onClick={() => setBlurRuleName(false)} className={"cursor-pointer font-bold text-2xl " + (blurRuleName ? "blur-md" : "")}>{Data[currentRule].rule}</span>
          <span onClick={() => setBlurRuleDesc(false)} className={"cursor-pointer " + (blurRuleDesc ? "blur-md" : "")}>{Data[currentRule].description}</span>
        </div>
        <ThreeColumns>
          <IndividualTrackQuiz
            track={tracks[0]}
            options={OPTIONS}
            answers={answers[currentRule]}
            setAnswerForCurrentRuleTrack={setAnswerForCurrentRuleTrack}
          />
          <IndividualTrackQuiz
            track={tracks[1]}
            options={OPTIONS}
            answers={answers[currentRule]}
            setAnswerForCurrentRuleTrack={setAnswerForCurrentRuleTrack}
          />
          <IndividualTrackQuiz
            track={tracks[2]}
            options={OPTIONS}
            answers={answers[currentRule]}
            setAnswerForCurrentRuleTrack={setAnswerForCurrentRuleTrack}
          />
        </ThreeColumns>
        <Controls
          currentRule={currentRule}
          setCurrentRule={setCurrentRule}
          guess={guess}
          resetAnswers={() => setAndSaveAnswers(DEFAULT_ANSWERS)}
        ></Controls>
      </main>
      <footer>
        <AnswersStats options={OPTIONS} stats={stats} />
      </footer>
    </>
  );
}

function AnswersStats({ options, stats }: { options: string[]; stats: Stats }) {
  return (
    <div className="flex justify-center gap-10 px-2 lg:px-5">
      {options.map((option) => {
        const correct = stats.byOption[option].correct;
        const guessed = stats.byOption[option].guessed;
        const percentage =
          guessed == 0 ? 0 : Math.round((100 * correct) / guessed);
        return (
          <div
            key={option}
            className="flex flex-1 border border-dotted border-neutral-500 p-1 rounded-xl overflow-hidden"
          >
            <Image
              className="w-10 h-10 rounded-xl align-middle hidden lg:block"
              src={`/spotify-challenge-2025/img/${option}.jpg`}
              alt=""
              width={40}
              height={40}
            />
            <div className="grid text-sm">
              <span className="leading-5 ps-5">{option}</span>
              <span className="leading-5 ps-5">
                {correct} / {guessed} ({percentage}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Controls({
  currentRule,
  setCurrentRule,
  guess,
  resetAnswers,
}: {
  currentRule: number;
  setCurrentRule: (_: number) => void;
  guess: () => void;
  resetAnswers: () => void;
}) {
  const currentIndex = currentRule;
  const previousIndex = (currentIndex - 1) % Data.length;
  const nextIndex = (currentIndex + 1) % Data.length;
  const btnClasses =
    "rounded-xl border px-5 py-3 hover:outline outline-offset-2 ";
  const btnNeutralClasses = "border-neutral-500 outline-neutral-300";
  const btnDangerClasses = "border-red-300 outline-red-500";
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-center gap-10">
        <button
          className={btnClasses + btnNeutralClasses}
          onClick={() => setCurrentRule(previousIndex)}
        >
          «
        </button>
        <button
          className={btnClasses + btnNeutralClasses + " w-36"}
          onClick={guess}
        >
          Guess
        </button>
        <button
          className={btnClasses + btnNeutralClasses}
          onClick={() => setCurrentRule(nextIndex)}
        >
          »
        </button>
      </div>
      <div className="lg:absolute lg:top-5 lg:right-5 justify-center">
        <button
          className={btnClasses + btnDangerClasses}
          onClick={() => {
            if (
              window.confirm(
                "This will delete all the answers you're previously given. Are you sure you want to delete them?"
              )
            ) {
              resetAnswers();
            }
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

function Progress({
  currentRule,
  setCurrentRule,
  stats,
}: {
  currentRule: number;
  setCurrentRule: (_: number) => void;
  stats: Stats;
}) {
  return (
    <>
      <div className="block lg:hidden">
        <select
          className="bg-transparent w-36 rounded-xl border border-dotted border-neutral-500 text-center"
          value={currentRule}
          onChange={(e) => setCurrentRule(Number(e.target.value))}
        >
          {Data.map((_, i) => (
            <option key={i} value={i}>
              {String(i + 1).padStart(3, "0")}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden lg:grid grid-cols-[repeat(25,1fr)] grid-rows-[repeat(5,1fr)] gap-1 text-sm">
        {Data.map((_, i) => {
          const selectedClasses =
            i == currentRule
              ? "outline outline-offset-2 outline-neutral-300"
              : "";
          const letterStats = stats.byRule[i];
          let backgroundColor = "";
          if (letterStats.locked && letterStats.correct == 0) {
            backgroundColor = "bg-red-500/50";
          } else if (
            letterStats.locked &&
            letterStats.correct == letterStats.options
          ) {
            backgroundColor = "bg-green-500/50";
          } else if (letterStats.locked) {
            backgroundColor = "bg-yellow-500/50";
          }
          return (
            <span
              key={i}
              className={`p-2 h-10 font-mono font-bold text-center border border-dotted border-neutral-500 aspect-square cursor-pointer ${selectedClasses} ${backgroundColor}`}
              onClick={() => setCurrentRule(i)}
            >
              {String(i + 1).padStart(3, "0")}
            </span>
          );
        })}
      </div>
    </>
  );
}

type IndividualTrackQuizProps = {
  track: Track;
  options: string[];
  answers: Answer;
  setAnswerForCurrentRuleTrack: (answer: string, track: Track) => void;
};
function IndividualTrackQuiz({
  track,
  options,
  answers,
  setAnswerForCurrentRuleTrack,
}: IndividualTrackQuizProps) {
  if (!track) return <></>;

  return (
    <OptionLayout main={<SpotifyWidget songId={track.uri} />}>
      <Option
        track={track}
        option={options[0]}
        answers={answers}
        setAnswerForCurrentRuleTrack={setAnswerForCurrentRuleTrack}
      />
      <Option
        track={track}
        option={options[1]}
        answers={answers}
        setAnswerForCurrentRuleTrack={setAnswerForCurrentRuleTrack}
      />
      <Option
        track={track}
        option={options[2]}
        answers={answers}
        setAnswerForCurrentRuleTrack={setAnswerForCurrentRuleTrack}
      />
    </OptionLayout>
  );
}

function SpotifyWidget({ songId }: { songId: string }) {
  return (
    <div className="relative">
      <iframe // this iframe is used just for the background color using blur
        className="absolute translate-y-full overflow-hidden blur-3xl -z-10 scale-y-[3] saturate-50 opacity-30"
        src={`https://open.spotify.com/embed/track/${songId.replace(
          "spotify:track:",
          ""
        )}?utm_source=generator`}
        width="100%"
        height="160"
        frameBorder="0"
        allowFullScreen={false}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
      <iframe // this is the actual iframe that will show up
        className="rounded-xl"
        src={`https://open.spotify.com/embed/track/${songId.replace(
          "spotify:track:",
          ""
        )}?utm_source=generator`}
        width="100%"
        height="160"
        frameBorder="0"
        allowFullScreen={false}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </div>
  );
}

type OptionProps = {
  track: Track;
  option: string;
  answers: Answer;
  setAnswerForCurrentRuleTrack: (answer: string, track: Track) => void;
};
function Option({
  track,
  option,
  answers,
  setAnswerForCurrentRuleTrack,
}: OptionProps) {
  if (!option) return <></>;
  const selectedAnswer = answers.selected[track.uri];
  const correctAnswer = track.added_by;
  const isThisOptionSelected = selectedAnswer == option;
  const isThisOptionCorrect = correctAnswer == option;
  const areAnswersLocked = answers.locked;

  let backgroundColor = "";

  if (areAnswersLocked && isThisOptionSelected && !isThisOptionCorrect) {
    backgroundColor = "bg-red-500/50";
  } else if (areAnswersLocked && isThisOptionCorrect) {
    backgroundColor = "bg-green-500/50";
  } else if (isThisOptionSelected) {
    backgroundColor = "bg-neutral-500/50";
  }

  return (
    <div
      className={`lg:p-3 p-2 flex cursor-pointer rounded-xl border border-dashed border-neutral-500 ${backgroundColor} outline-offset-4 outline-neutral-300 hover:outline`}
      onClick={() => setAnswerForCurrentRuleTrack(option, track)}
    >
      <Image
        className="w-10 h-10 rounded-xl align-middle"
        src={`/spotify-challenge-2025/img/${option}.jpg`}
        alt=""
        width={40}
        height={40}
      />
      <span className="leading-10 ps-5 text-center">{option}</span>
    </div>
  );
}

type Stats = {
  totalAnswered: number;
  byRule: {
    [index: number]: { locked: Boolean; options: number; correct: number };
  };
  byOption: any;
};
function computeStats(
  data: typeof Data,
  answers: Answer[],
  options: string[]
): Stats {
  const totalAnswered = Object.values(answers).filter(
    (answer) => answer.locked
  ).length;

  const byRule = data.map((_: any, i: number) => ({
    locked: answers[i].locked,
    options: 3,
    correct: data[i].tracks
      .map((track) => answers[i].selected[track.uri] == track.added_by)
      .filter(Boolean).length,
  }));

  const defaultOptionStats: Stats["byOption"] = {};
  const lockedAnswers = Object.values(answers)
    .filter((answer) => answer.locked)
    .map((answer) => answer.selected)
    .reduce(Object.assign, {});
  const byOption = options.reduce((result, option) => {
    result[option] = {
      guessed: Object.values(answers)
        .filter((answer) => answer.locked)
        .flatMap((answer) => Object.values(answer.selected))
        .filter((name) => name == option).length,
      correct: Object.values(data)
        .flatMap((e) => e.tracks)
        .filter(
          (track) =>
            lockedAnswers[track.uri] == option &&
            lockedAnswers[track.uri] == track.added_by
        ).length,
    };
    return result;
  }, defaultOptionStats);

  return { totalAnswered, byRule, byOption };
}

function OptionLayout({
  children,
  main = null,
}: {
  children: React.ReactNode;
  main?: React.ReactNode;
}) {
  return (
    <div className="lg:grid lg:gap-2 select-none">
      {main}
      <div className="grid gap-2">{children}</div>
    </div>
  );
}

function ThreeColumns({
  children,
}: {
  children: string | JSX.Element | JSX.Element[];
}) {
  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-rows-1 lg:grid-cols-3 lg:gap-x-20">
      {children}
    </div>
  );
}
