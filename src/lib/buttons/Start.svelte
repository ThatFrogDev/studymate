<script lang="ts">
  import { POMODORO as pomodoro, SHORT_BREAK as shortBreak, LONG_BREAK as longBreak } from "@/utils/constants";
  import pauseIcon from "~/assets/icon/pause.png";
  import playIcon from "~/assets/icon/play.png";
  import timeUp from "~/assets/sound/time-up.wav";
  import toDoubleDigit from "@/utils/toDoubleDigit";

  const timeUpSound = new Audio(timeUp);

  export let buttonState: "START" | "PAUSE" = "START";
  export let timer: HTMLElement | null = document.getElementById("timer");
  export let timerType: "POMODORO" | "SHORT_BREAK" | "LONG_BREAK" = "POMODORO";

  let timeBetween: number = 0; 

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

  browser.runtime.onMessage.addListener((message, sender, onResponse) => {
    if (message.type === "PLAY_TIMER") {
      timeUpSound.play();
    } else if (message.type === "UPDATE_TIMER") {
      if (timer) {
        timer.innerText = message.time;
      }
    }
  });

  const getMinutesSeconds = (time: number) => ({
    minutes: toDoubleDigit(Math.floor((time / 60000) % 60)),
    seconds: toDoubleDigit(Math.floor((time / 1000) % 60))
  });

  $: ({ minutes, seconds } = getMinutesSeconds(timeBetween));

  console.log(`debug> minutes: ${minutes}, seconds: ${seconds}`);

  if (timer) {
    timer.innerHTML = `${minutes}:${seconds}`;
  }

  const handleClick = async () => {
    if (buttonState === "START") {
      const response = await browser.runtime.sendMessage({ type: "START_TIMER", time: timeBetween });
      if (timer && response) timer.innerText = `${getMinutesSeconds(response.time).minutes}: ${getMinutesSeconds(response.time).seconds}`;
    } else {
      const response = await browser.runtime.sendMessage({ type: "PAUSE_TIMER", time: timeBetween });
      if (timer && response) timer.innerText = `${getMinutesSeconds(response.time).minutes}: ${getMinutesSeconds(response.time).seconds}`;
    }
    
    const buttonStateResponse = await browser.runtime.sendMessage({ type: "UPDATE_BUTTON_STATE", buttonState });
    if (buttonStateResponse) buttonState = buttonStateResponse.buttonState;
  };
</script>

<button id="timerButton" on:click={handleClick}>
  {#if buttonState === "START"}
    <img src={playIcon} width="12" alt="Play" />
  {:else}
    <img src={pauseIcon} width="12" alt="Pause" />
  {/if}
</button>
