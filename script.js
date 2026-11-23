/* CUCUMBER CUTTING FRENZY — SITE INTERACTIONS
   The website is intentionally self-contained and framework-free.
   To replace a media placeholder, save a photo/diagram at its filename in index.html.
*/
(() => {
  'use strict';

  // ----------------------------------------------------
  // PLAYABLE GAME DEMO (browser-only recreation)
  // ----------------------------------------------------
  const gameDemo = document.getElementById('gameDemo');
  const gameBoard = document.getElementById('gameBoard');
  const knifeHandle = document.getElementById('knifeHandle');
  const knifeRig = document.getElementById('knifeRig');
  const gameKnob = document.getElementById('difficultyKnob');
  const gameTime = document.getElementById('gameTime');
  const gameStatus = document.getElementById('gameStatus');
  const gameCountdown = document.getElementById('gameCountdown');
  const countdownNumber = document.getElementById('countdownNumber');
  const gamePhaseLabel = document.getElementById('gamePhaseLabel');
  const gameScore = document.getElementById('gameScore');
  const gameLevel = document.getElementById('gameLevel');
  const gameCutGoal = document.getElementById('gameCutGoal');
  const gameCuts = document.getElementById('gameCuts');
  const gameLeds = document.getElementById('gameLeds');
  const cutSplash = document.getElementById('cutSplash');
  const gameReset = document.getElementById('gameReset');
  if (gameDemo && gameBoard && knifeHandle && gameKnob) {
    let level = 3;
    let phase = 'ready';             // ready / countdown / playing / grace / ended
    let position = .12;             // 0 = knife raised; 1 = knife down
    let held = false;
    let raisedSinceLastCut = false;
    let pointerId = null;
    let knobPointerId = null;
    let downY = 0;
    let startPosition = position;
    let chops = 0;
    let cucumbers = 0;
    let countdownStart = 0;
    let playStart = 0;
    let releaseStart = 0;
    let animationFrame = null;

    function setMessage(message) { gameStatus.textContent = message; }
    function renderKnife() {
      knifeRig.style.setProperty('--knife-shift', `${Math.round(position * Math.min(93, gameBoard.clientHeight * .22))}px`);
    }
    function renderLeds() {
      const target = level * 5;
      const lit = phase === 'ready' || phase === 'countdown'
        ? level
        : Math.max(0, Math.ceil((target - chops) / target * 6));
      [...gameLeds.children].forEach((led, i) => led.classList.toggle('is-on', i < lit));
      gameLeds.setAttribute('aria-label', `${lit} of 6 LED indicators illuminated`);
    }
    function renderScore() {
      gameCuts.textContent = String(chops);
      gameCutGoal.textContent = String(level * 5);
      gameScore.textContent = String(cucumbers).padStart(2, '0');
      renderLeds();
    }
    function setPhase(next) {
      phase = next;
      const labels = {ready:'READY', countdown:'COUNTDOWN', playing:'CHOPPING', grace:'RE-GRAB!', ended:'GAME OVER'};
      gamePhaseLabel.textContent = labels[phase];
      gameDemo.classList.toggle('is-playing', phase === 'playing');
      gameDemo.classList.toggle('is-over', phase === 'ended');
      gameKnob.setAttribute('aria-disabled', String(phase !== 'ready'));
      renderLeds();
    }
    function setLevel(next) {
      if (phase !== 'ready') return;
      level = Math.min(5, Math.max(1, Math.round(next)));
      gameLevel.textContent = String(level).padStart(2, '0');
      gameKnob.style.setProperty('--knob-angle', `${-120 + (level - 1) * 60}deg`);
      gameKnob.setAttribute('aria-valuenow', String(level));
      gameKnob.setAttribute('aria-valuetext', `Level ${level}, ${level * 5} chops per cucumber`);
      renderScore();
      setMessage(`Level ${level} selected · ${level * 5} cuts per cucumber. Hold the knife to begin.`);
    }
    function showCountdown(value, subtitle) {
      gameCountdown.hidden = false;
      countdownNumber.textContent = value;
      gameCountdown.querySelector('small').textContent = subtitle;
    }
    function hideCountdown() { gameCountdown.hidden = true; }
    function scheduleTick() {
      if (animationFrame !== null) return;
      animationFrame = requestAnimationFrame(tick);
    }
    function tick(now) {
      animationFrame = null;
      if (phase === 'countdown') {
        const remaining = Math.ceil((3000 - (now - countdownStart)) / 1000);
        if (remaining > 0) {
          showCountdown(String(remaining), 'GET READY');
        } else {
          setPhase('playing');
          playStart = now;
          raisedSinceLastCut = held && position < .3;
          hideCountdown();
          gameTime.textContent = '60';
          setMessage('GO! Raise the knife, then drag down to chop. Keep holding!');
        }
      }
      if (phase === 'playing' || phase === 'grace') {
        const remaining = Math.max(0, 60 - (now - playStart) / 1000);
        gameTime.textContent = String(Math.ceil(remaining)).padStart(2, '0');
        if (remaining <= 0) {
          finishRound(false);
        } else if (phase === 'grace') {
          const seconds = Math.ceil((3000 - (now - releaseStart)) / 1000);
          if (seconds <= 0) finishRound(true);
          else showCountdown(String(seconds), 'RE-GRAB!');
        }
      }
      if (phase === 'countdown' || phase === 'playing' || phase === 'grace') scheduleTick();
    }
    function beginCountdown() {
      setPhase('countdown');
      countdownStart = performance.now();
      showCountdown('3','GET READY');
      setMessage('Hold the handle through the 3-second countdown.');
      scheduleTick();
    }
    function finishRound(aborted) {
      setPhase('ended');
      raisedSinceLastCut = false;
      gameTime.textContent = aborted ? gameTime.textContent : '00';
      showCountdown(aborted ? '×' : 'END', aborted ? 'ROUND CANCELLED' : 'TIME UP');
      setMessage(aborted
        ? 'Handle released too long. Round cancelled — press Reset to play again.'
        : `Time! ${cucumbers} cucumber${cucumbers === 1 ? '' : 's'} completed · ${cucumbers} treat${cucumbers === 1 ? '' : 's'} earned. Press Reset to replay.`);
    }
    function triggerCut() {
      chops += 1;
      cutSplash.classList.remove('burst');
      void cutSplash.offsetWidth; // restart CSS effect
      cutSplash.classList.add('burst');
      if (chops >= level * 5) {
        cucumbers += 1;
        chops = 0;
        setMessage(`Cucumber complete! ${cucumbers} treat${cucumbers === 1 ? '' : 's'} earned. Keep chopping!`);
      } else {
        setMessage(`Good chop! ${chops} of ${level * 5} cuts · lift the knife for the next one.`);
      }
      renderScore();
    }
    function moveKnife(next) {
      position = Math.min(1, Math.max(0, next));
      renderKnife();
      if (phase !== 'playing' || !held) return;
      if (position <= .27) raisedSinceLastCut = true;
      if (position >= .74 && raisedSinceLastCut) {
        raisedSinceLastCut = false;
        triggerCut();
      }
    }
    function grabKnife() {
      if (held || phase === 'ended') return;
      held = true;
      knifeHandle.classList.add('is-grabbing');
      if (phase === 'ready') beginCountdown();
      else if (phase === 'grace') {
        setPhase('playing');
        hideCountdown();
        raisedSinceLastCut = position <= .27;
        setMessage('Nice save! Raise the knife, then chop.');
      }
    }
    function releaseKnife() {
      if (!held) return;
      held = false;
      knifeHandle.classList.remove('is-grabbing');
      raisedSinceLastCut = false;
      if (phase === 'countdown') {
        setPhase('ready');
        hideCountdown();
        setMessage('Countdown cancelled. Hold the knife again to restart.');
      } else if (phase === 'playing') {
        setPhase('grace');
        releaseStart = performance.now();
        showCountdown('3','RE-GRAB!');
        setMessage('Knife released! Re-grab the handle within 3 seconds.');
      }
    }
    knifeHandle.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      pointerId = e.pointerId;
      downY = e.clientY;
      startPosition = position;
      try { knifeHandle.setPointerCapture(pointerId); } catch (_) {}
      grabKnife();
    });
    knifeHandle.addEventListener('pointermove', e => {
      if (!held || pointerId !== e.pointerId) return;
      const distance = Math.max(60, Math.min(93, gameBoard.clientHeight * .22));
      moveKnife(startPosition + (e.clientY - downY) / distance);
    });
    knifeHandle.addEventListener('pointerup', e => {
      if (e.pointerId === pointerId) { pointerId = null; releaseKnife(); }
    });
    knifeHandle.addEventListener('pointercancel', e => {
      if (e.pointerId === pointerId) { pointerId = null; releaseKnife(); }
    });
    knifeHandle.addEventListener('lostpointercapture', () => {
      if (pointerId !== null) { pointerId = null; releaseKnife(); }
    });
    // Keyboard: hold Space on the knife; use Up and Down to move it.
    knifeHandle.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!e.repeat) grabKnife();
      } else if (held && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        moveKnife(position + (e.key === 'ArrowDown' ? .31 : -.31));
      }
    });
    knifeHandle.addEventListener('keyup', e => {
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); releaseKnife(); }
    });
    window.addEventListener('blur', releaseKnife);
    function updateKnobFromPointer(e) {
      const rect = gameKnob.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      // Ignore near-center presses; they do not specify a reliable angle.
      if (Math.hypot(dx, dy) < rect.width * .17) return;
      let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      if (angle > 180) angle -= 360;
      const snapped = Math.round((Math.min(120,Math.max(-120,angle)) + 120) / 60) + 1;
      setLevel(snapped);
    }
    gameKnob.addEventListener('pointerdown', e => {
      if (phase !== 'ready' || (e.button !== undefined && e.button !== 0)) return;
      e.preventDefault();
      knobPointerId = e.pointerId;
      try {gameKnob.setPointerCapture(knobPointerId);} catch (_) {}
      updateKnobFromPointer(e);
    });
    gameKnob.addEventListener('pointermove', e => {
      if (e.pointerId === knobPointerId) updateKnobFromPointer(e);
    });
    gameKnob.addEventListener('pointerup', e => {
      if (e.pointerId === knobPointerId) knobPointerId = null;
    });
    gameKnob.addEventListener('pointercancel', e => {
      if (e.pointerId === knobPointerId) knobPointerId = null;
    });
    gameKnob.addEventListener('keydown', e => {
      if (phase !== 'ready') return;
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {e.preventDefault();setLevel(level+1);}
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {e.preventDefault();setLevel(level-1);}
      else if (e.key === 'Home') {e.preventDefault();setLevel(1);}
      else if (e.key === 'End') {e.preventDefault();setLevel(5);}
    });
    gameReset.addEventListener('click', () => {
      held = false;
      pointerId = null;
      knifeHandle.classList.remove('is-grabbing');
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      animationFrame = null;
      setPhase('ready');
      position = .12;
      raisedSinceLastCut = false;
      chops = 0;
      cucumbers = 0;
      hideCountdown();
      gameTime.textContent = '60';
      renderKnife();
      setLevel(level);
    });
    renderKnife();
    setLevel(3);
  }

  // Media slots automatically change from their editable instructions
  // to a real image as soon as a file exists at the specified path.
  document.querySelectorAll('[data-media-slot]').forEach(slot => {
    const img = slot.querySelector('img');
    if (!img) return;
    const showImage = () => slot.classList.toggle('has-image', img.naturalWidth > 0);
    img.addEventListener('load', showImage);
    img.addEventListener('error', () => slot.classList.remove('has-image'));
    if (img.complete) showImage();
  });

  // Collapsible mobile navigation.
  const menuToggle = document.getElementById('menuToggle');
  const primaryNav = document.getElementById('primaryNav');
  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      primaryNav.classList.toggle('is-open', open);
    });
    primaryNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      primaryNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    }));
  }

  // Compact scroll progress indicator.
  const readingProgress = document.getElementById('readingProgress');
  let scheduled = false;
  function updateReadingProgress() {
    const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    readingProgress.style.transform = `scaleX(${Math.min(1, window.scrollY / total)})`;
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateReadingProgress);
  }, {passive:true});
  window.addEventListener('resize', updateReadingProgress);
  updateReadingProgress();

  // Service pseudocode: short, editable summaries of the project services.
  // Source basis: ProjectSource/*.c from the shared firmware snapshot.
  const serviceSelect = document.getElementById('serviceSelect');
  const servicePseudocode = document.getElementById('servicePseudocode');
  const serviceFileName = document.getElementById('serviceFileName');
  const serviceRole = document.getElementById('serviceRole');
  const serviceEvents = document.getElementById('serviceEvents');
  const serviceExplanationTitle = document.getElementById('serviceExplanationTitle');
  const serviceExplanation = document.getElementById('serviceExplanation');

  const serviceGuides = {
    setup: {
      file: 'SetupService.c',
      role: 'Selects difficulty and starts the game only after a completed countdown.',
      events: 'ES_POTENTIOMETER · ES_HANDLE_TOUCH · COUNTDOWN_TIMER',
      title: 'SetupService: how a round begins',
      explanation: 'The service owns setup, difficulty selection, the three-second countdown, and resetting to the initial state.',
      pseudocode: `ON INITIALIZE OR RESET:
    stop old timers and active services
    park timer arm
    read potentiometer
    choose difficulty 1 through 5
    set required chops = difficulty × 5
    update LED difficulty display

ON POTENTIOMETER CHANGE (while selecting):
    update difficulty and LED display
    play difficulty feedback sound

ON HANDLE TOUCH (while selecting):
    start 3-second countdown and audio

ON HANDLE RELEASE (during countdown):
    cancel countdown and stop audio
    return to selection

ON COUNTDOWN TIMEOUT:
    start 60-second gameplay timer
    notify PlayService and DeadmanHandling`
    },
    play: {
      file: 'PlayService.c',
      role: 'Determines valid chops, tracks completed cucumbers, and starts dispensing when time expires.',
      events: 'ES_PLAY · ES_BEAM_UNBROKEN · ES_CHOP · PLAY_TIMER',
      title: 'PlayService: scoring and round timing',
      explanation: 'A chop is only valid when the game is active, the knife handle is held, and the break-beam indicated a sufficient lift.',
      pseudocode: `ON ES_PLAY:
    set game active and mark handle held
    set cut target from chosen difficulty
    reset chop count and earned treats
    initialize break-beam eligibility
    show LED progress and start timer-arm motion

ON BREAK-BEAM CLEARED (while holding):
    mark knife as raised high enough

ON CHOP BUTTON EVENT:
    if game inactive OR handle released: ignore
    else if knife was not raised: play warning
    else:
        count the chop
        require another lift before next chop
        if cucumber target is reached:
            add one earned treat
            reset chop progress
            flash LEDs and play completion sound
        else:
            update remaining-chop LEDs
            play valid-chop sound

ON TIMER-ARM TIMEOUT:
    advance timer arm and schedule next update

ON 60-SECOND ROUND TIMEOUT:
    stop gameplay and disarm deadman timer
    play endgame sound
    send earned treat count to TREATService`
    },
    deadman: {
      file: 'DeadmanHandling.c',
      role: 'Rejects chops when the knife is released and allows a three-second re-grab window.',
      events: 'ES_HANDLE_RELEASE · ES_HANDLE_TOUCH · DEADMAN_TIMER',
      title: 'DeadmanHandling: release and re-grab logic',
      explanation: 'The gameplay clock keeps running during the grace period. A failed re-grab aborts the round without dispensing rewards.',
      pseudocode: `ON ES_PLAY:
    arm deadman safety monitoring
    clear any previous grace timer

ON HANDLE RELEASE (during active game):
    inform PlayService so chops are rejected
    start 3-second DEADMAN_TIMER

ON HANDLE TOUCH:
    cancel grace timer
    if game active:
        inform PlayService that handle is held
        do not award a chop

ON DEADMAN_TIMER TIMEOUT:
    if game active AND handle still released:
        stop PlayService
        play handle-release warning sound
        request reset to setup

ON STOP OR RESET:
    disarm the grace timer`
    },
    audio: {
      file: 'AudioService.c',
      role: 'Runs audio cues without blocking the other game services.',
      events: 'ES_AUDIO_* · ES_TIMEOUT / AUDIO_TIMER',
      title: 'AudioService: nonblocking sound cues',
      explanation: 'Timer3 and OC4 generate buzzer tones. A separate framework timer advances through note sequences without delaying gameplay.',
      pseudocode: `ON AUDIO EVENT:
    identify requested tune:
        difficulty, countdown, chop, warning,
        cucumber complete, handle release, or endgame
    compare tune priority with current sound
    if permitted to interrupt:
        select new tune and begin first note

TO PLAY ONE NOTE:
    if note is a rest: silence buzzer
    else: set buzzer PWM frequency and duty
    start AUDIO_TIMER for this note duration

ON AUDIO_TIMER TIMEOUT:
    advance to next note
    if more notes remain: play next note
    else: stop sound

ON ES_AUDIO_STOP:
    stop note timer and silence buzzer`
    },
    treat: {
      file: 'TREATService.c',
      role: 'Alternates the treat servo between open and closed until earned rewards are dispensed.',
      events: 'ES_DISPENSE_TREATS · TREAT_TIMER · ES_RESET',
      title: 'TREATService: dispensing earned treats',
      explanation: 'A small internal state machine times the SG90 open/close positions and posts a reset after the last treat.',
      pseudocode: `ON ES_DISPENSE_TREATS(count):
    cancel any previous dispense timer
    limit treat count to 10
    command dispenser to its closed position
    set remaining treats = count
    if count is zero: finish immediately
    else: open dispenser for next treat

ON TREAT_TIMER TIMEOUT while OPEN:
    move servo to closed position
    wait for next treat to load

ON TREAT_TIMER TIMEOUT while CLOSED_WAIT:
    subtract one from remaining treats
    if treats remain:
        reopen dispenser and repeat
    else:
        stop timer, close dispenser
        post ES_RESET to SetupService

ON ES_RESET:
    stop timer and park dispenser closed`
    },
    led: {
      file: 'LEDService.c',
      role: 'Supporting LED module for difficulty, remaining-chop progress, and completion flashes.',
      events: 'LED count · cut progress · flash interval',
      title: 'LEDService: LED display support',
      explanation: 'Six LEDs are written through the 74HC595 shift register. The mapping from logical bit order to physical LED order depends on the final wiring.',
      pseudocode: `WHEN DIFFICULTY CHANGES:
    clamp requested LED count to 0 through 6
    generate the corresponding shift-register bits
    send the bit pattern over SPI2

WHEN CHOP PROGRESS CHANGES:
    calculate remaining = target - completed
    scale remaining chops to a 0–6 LED bar
    update the shift register

WHEN COMPLETION FLASH IS REQUESTED:
    save current LED count
    alternate LED output patterns on each interval
    when flash duration ends:
        restore the saved LED pattern

NOTE:
    this module supports the main game services`
    }
  };

  function renderServiceGuide() {
    if (!serviceSelect || !servicePseudocode) return;
    const guide = serviceGuides[serviceSelect.value] || serviceGuides.setup;
    serviceFileName.textContent = guide.file;
    servicePseudocode.textContent = guide.pseudocode;
    serviceRole.textContent = guide.role;
    serviceEvents.textContent = guide.events;
    serviceExplanationTitle.textContent = guide.title;
    serviceExplanation.textContent = guide.explanation;
  }
  if (serviceSelect) {
    serviceSelect.addEventListener('change', renderServiceGuide);
    renderServiceGuide();
  }

  // Copy code example: useful when exploring the firmware architecture.
  document.querySelectorAll('[data-copy-target]').forEach(button => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target.innerText);
        const old = button.textContent;
        button.textContent = 'COPIED ✓';
        setTimeout(() => { button.textContent = old; }, 1300);
      } catch (e) {
        // Clipboard permission is not always available from file:// URLs.
        button.textContent = 'SELECT CODE TO COPY';
      }
    });
  });
})();
