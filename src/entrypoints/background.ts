import { POMODORO as pomodoro, SHORT_BREAK as shortBreak, LONG_BREAK as longBreak } from "@/utils/constants";
import { countdown } from "@/utils/countdown";
import toDoubleDigit from "@/utils/toDoubleDigit";

export let timerType: "POMODORO" | "SHORT_BREAK" | "LONG_BREAK" = "POMODORO";
export let buttonState: "START" | "PAUSE" = "START";
export let completedSessions = {
  completedPomodoros: 0,
  completedShortBreaks: 0,
  completedLongBreaks: 0
};

let interval: NodeJS.Timeout | null = null;
let timeBetween: number;

export default defineBackground(() => {
  console.log("info> started StudyMate", { id: browser.runtime.id });

  const getMinutesSeconds = (time: number) => {
    const minutes = toDoubleDigit(Math.floor(time / 60));
    const seconds = toDoubleDigit(time % 60);
    return { minutes, seconds };
  };

  const updateTimer = (time: number) => {
    let { minutes, seconds } = getMinutesSeconds(time);
    return `${minutes}:${seconds}`;
  };

  const playTimer = (time: number) => {
    interval = countdown(time, (remainingTime) => {
      timeBetween = remainingTime;
      browser.runtime.sendMessage({ type: "UPDATE_TIMER", time: updateTimer(timeBetween) });
    }, () => {
      if (timerType === "POMODORO") {
        completedSessions.completedPomodoros += 1;
      } else if (timerType === "SHORT_BREAK") {
        completedSessions.completedShortBreaks += 1;
      } else if (timerType === "LONG_BREAK") {
        completedSessions.completedLongBreaks += 1;
      }
      browser.runtime.sendMessage({ type: "PLAY_TIMER" });
    });
  };

  const pauseTimer = () => {
    if (interval !== null) clearInterval(interval);
  };

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "START_TIMER") {
      playTimer(message.time);
      sendResponse({ status: "timerStarted", time: updateTimer(timeBetween) });
    } else if (message.type === "PAUSE_TIMER") {
      pauseTimer();
      sendResponse({ status: "timerPaused", time: updateTimer(timeBetween) });
    } else if (message.type === "UPDATE_BUTTON_STATE") {
      buttonState = message.buttonState;
      sendResponse({ status: "buttonStateUpdated", buttonState });
    }

    console.log(`debug> received message: ${message.type} with additional data: ${JSON.stringify(message)}`);
    return true;
  });
});
