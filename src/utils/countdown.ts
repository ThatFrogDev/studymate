/**
 * This function will countdown from a certain time and update the timer element.
 * @param timer The element where the timer will be displayed.
 * @param time The time you want to countdown from in milliseconds.
 * @param onUpdate A callback function that will be called with the remaining time.
 * @returns The interval ID which can be used to clear the interval.
 */

export function countdown(
  time: number,
  onUpdate?: (timeBetween: number) => void,
  onFinish?: () => void,
): NodeJS.Timeout {
  let now = Date.now();
  let completed = now + time;

  const countdown = setInterval(function () {
    now = Date.now();
    let timeBetween = completed - now;
    if (onUpdate) onUpdate(timeBetween);

    if (timeBetween <= 0) {
      clearInterval(countdown);
      if (onFinish) onFinish();
    }
  }, 500);

  return countdown;
}
