<script lang="ts">
import Start from "@/lib/buttons/Start.svelte";
import TimerType from "@/lib/buttons/TimerType.svelte";

let timer: HTMLElement | null | undefined = $state();
let timerType: "POMODORO" | "SHORT_BREAK" | "LONG_BREAK" = $state("POMODORO");
let buttonState: "START" | "PAUSE" = $state("START");
let completedSessions = $state({
  completedPomodoros: 0,
  completedShortBreaks: 0,
  completedLongBreaks: 0
});
</script>

<main>
  <div class="logo">
    <h2>StudyMate</h2>
  </div>

  <div class="timer-type">
    <TimerType bind:timerType={timerType} bind:buttonState={buttonState} bind:completedSessions={completedSessions} />
  </div>
  <div class="pomodoro">
    <h1 id="timer" bind:this={timer}>--:--</h1> 
  </div>

  <div class="buttons">
    <Start bind:buttonState={buttonState} {timer} {timerType} bind:completedSessions={completedSessions} />
  </div>
</main>
