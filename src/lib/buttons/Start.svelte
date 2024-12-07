<script lang="ts">
  import {
    POMODORO as pomodoro,
    SHORT_BREAK as shortBreak,
    LONG_BREAK as longBreak,
  } from "@/utils/constants";
  import pauseIcon from "~/assets/icon/pause.png";
  import playIcon from "~/assets/icon/play.png";
  import timeUp from "~/assets/sound/time-up.wav";
  import toDoubleDigit from "@/utils/toDoubleDigit";
  import { onMount } from "svelte";

  const timeUpSound = new Audio(timeUp);

  export let buttonState: "START" | "PAUSE" = "START";
  export let timer: HTMLElement | null = document.getElementById("timer");
  export let timerType: "POMODORO" | "SHORT_BREAK" | "LONG_BREAK" = "POMODORO";
  export let completedSessions = {
    completedPomodoros: 0,
    completedShortBreaks: 0,
    completedLongBreaks: 0,
  };

  let timeBetween: number = 0;
  let shouldUpdateTimer = true;

  onMount(async () => {
  const state = await browser.runtime.sendMessage({ type: "GET_STATE" });
  if (state) {
      /*buttonState = state.buttonState*/;
      timerType = state.timerType;
      completedSessions = state.completedSessions;
    }
  });


  const initializeTimer = () => {
    switch (timerType) {
      case "POMODORO":
        timeBetween = Number(pomodoro);
        break;
      case "SHORT_BREAK":
        timeBetween = Number(shortBreak);
        break;
      case "LONG_BREAK":
        timeBetween = Number(longBreak);
        break;
    }
  };

  initializeTimer();

  console.log(`debug> timeBetween: ${timeBetween}`);

  $: {
    browser.runtime.onMessage.addListener((message, sender, onResponse) => {
      if (message.type === "PLAY_TIMER") {
        timeUpSound.play();
      } else if (message.type === "UPDATE_TIMER") {
        if (timer) {
          timer.innerText = message.time;
          timeBetween = message.time
            .split(":")
            .reduce((acc: number, time: number, index: number) => {
              if (index === 0) {
                return acc + Number(time) * 60000;
              } else {
                return acc + Number(time) * 1000;
              }
            }, 0);
        }
      }
    });
  }

  const getMinutesSeconds = (time: number) => ({
    minutes: toDoubleDigit(Math.floor((time / 60000) % 60)),
    seconds: toDoubleDigit(Math.floor((time / 1000) % 60)),
  });

  $: ({ minutes, seconds } = getMinutesSeconds(timeBetween));

  const changeButtonState = () => {
    buttonState = buttonState === "START" ? "PAUSE" : "START";
  };

  $: {
    if (shouldUpdateTimer && timer) {
      timer.innerHTML = `${minutes}:${seconds}`;
      shouldUpdateTimer = false;
    }
  }

  const handleClick = async () => {
    if (buttonState === "START") {
      await browser.runtime.sendMessage({
        type: "START_TIMER",
        time: timeBetween,
      });
    } else {
      const response = await browser.runtime.sendMessage({
        type: "PAUSE_TIMER",
        time: timeBetween,
      });
      if (timer && response) {
        const time = Number(response.time);
        if (!isNaN(time)) {
          const { minutes, seconds } = getMinutesSeconds(time);
          timer.innerText = `${minutes}:${seconds}`;
        }
      }
    }

    changeButtonState();
  };
</script>

<button id="timerButton" on:click={handleClick}>
  {#if buttonState === "START"}
    <img src={playIcon} width="12" alt="Play" />
  {:else}
    <img src={pauseIcon} width="12" alt="Pause" />
  {/if}
</button>
