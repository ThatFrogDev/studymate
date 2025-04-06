/**
 * @readonly The app-wide default constants
 */

export const PROD = false; // Set to false for development/testing

let pomodoroTime: number;
let shortBreakTime: number;
let longBreakTime: number;

if (PROD) {
  pomodoroTime = 1500000; // 25 minutes
  shortBreakTime = 300000; // 5 minutes
  longBreakTime = 900000; // 15 minutes
} else {
  pomodoroTime = 7000;
  shortBreakTime = 3000;
  longBreakTime = 5000;
}

export const POMODORO = new Date(pomodoroTime);
export const SHORT_BREAK = new Date(shortBreakTime);
export const LONG_BREAK = new Date(longBreakTime);
