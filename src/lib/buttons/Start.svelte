<script lang="ts">
  import { run } from 'svelte/legacy';

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

  interface Props {
    buttonState?: "START" | "PAUSE";
    timer?: HTMLElement | null;
    timerType?: "POMODORO" | "SHORT_BREAK" | "LONG_BREAK";
    completedSessions?: any;
  }

  let {
    buttonState = $bindable("START"),
    timer = $bindable(document.getElementById("timer")),
    timerType = $bindable("POMODORO"),
    completedSessions = $bindable({
    completedPomodoros: 0,
    completedShortBreaks: 0,
    completedLongBreaks: 0,
  })
  }: Props = $props();

  let timeBetween: number = $state(0);
  let shouldUpdateTimer = $state(true);

  onMount(async () => {
    const state = await browser.runtime.sendMessage({ type: "GET_STATE" });
    if (state) {
      timerType = state.timerType;
      completedSessions = state.completedSessions;
    }
    initializeTimer(timerType);
  });

  const initializeTimer = (timerType: "POMODORO" | "SHORT_BREAK" | "LONG_BREAK") => {
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

    if (timer) {
      const { minutes, seconds } = getMinutesSeconds(timeBetween);
      timer.innerHTML = `${minutes}:${seconds}`;
    }
  };

  const resetTimer = () => {
    switch (timerType) {
      case "POMODORO":
        timeBetween = Number(pomodoro);
        buttonState = "START";
        break;
      case "SHORT_BREAK":
        timeBetween = Number(shortBreak);
        buttonState = "START";
        break;
      case "LONG_BREAK":
        timeBetween = Number(longBreak);
        buttonState = "START";
        break;
    }
    if (timer) {
      const { minutes, seconds } = getMinutesSeconds(timeBetween);
      timer.innerHTML = `${minutes}:${seconds}`;
    }
  };

  initializeTimer(timerType);

  $effect(() => {
    browser.runtime.onMessage.addListener((message, sender, onResponse) => {
      if (message.type === "RESET_TIMER") {
        // TODO: Move this process to the background; e.g. in a offscreen document.
        timeUpSound.play();
        completedSessions = message.completedSessions;
        resetTimer();
      } else if (message.type === "INIT_TIMER") {
        initializeTimer(message.timerType);
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
  });

  const getMinutesSeconds = (time: number) => ({
    minutes: toDoubleDigit(Math.floor((time / 60000) % 60)),
    seconds: toDoubleDigit(Math.floor((time / 1000) % 60)),
  });

  let { minutes, seconds } = $derived(getMinutesSeconds(timeBetween));

  const changeButtonState = () => {
    buttonState = buttonState === "START" ? "PAUSE" : "START";
  };

  $effect(() => {
    if (shouldUpdateTimer && timer) {
      timer.innerHTML = `${minutes}:${seconds}`;
      shouldUpdateTimer = false;
    }
  });

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

<button id="timerButton" onclick={handleClick}>
  {#if buttonState === "START"}
    <img src={playIcon} width="12" alt="Play" />
  {:else}
    <img src={pauseIcon} width="12" alt="Pause" />
  {/if}
</button>
