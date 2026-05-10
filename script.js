const cursorGlow = document.querySelector(".cursor-glow");
const revealItems = document.querySelectorAll(".reveal");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const tiltCards = document.querySelectorAll("[data-tilt]");
const openButtons = document.querySelectorAll("[data-open-letter]");
const closeButtons = document.querySelectorAll("[data-close-letter]");
const letterModal = document.querySelector(".letter-modal");
const letterDialog = document.querySelector(".letter-dialog");
const letterSheet = document.querySelector(".letter-sheet");
const letterEyebrow = document.querySelector("[data-letter-eyebrow]");
const letterTitle = document.querySelector("[data-letter-title]");
const letterCopy = document.querySelector("[data-letter-copy]");
const letterSignoff = document.querySelector("[data-letter-signoff]");
const letterPrompt = document.querySelector("[data-letter-prompt]");
const letterFeedback = document.querySelector("[data-letter-feedback]");
const answerButtons = document.querySelectorAll("[data-letter-answer]");
const heartStage = document.querySelector(".heart-stage");
const audioToggle = document.querySelector("[data-audio-toggle]");
const audioToggleLabel = audioToggle?.querySelector(".music-toggle__label");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const canUsePlaylistAudio = typeof Audio !== "undefined";

let latestScroll = window.scrollY;
let ticking = false;
let lastFocusedElement = null;
let currentLetterMode = "gentle";
let noButtonTeaseCount = 0;
let audioContext = null;
let musicMasterGain = null;
let musicLoopTimer = 0;
let musicIsPlaying = false;
let musicUserStopped = false;
let currentTrackIndex = 0;
let musicMode = "none";
let activeTrackTitle = "";
let playlistAudio = null;

const musicProgression = [
  [57, 60, 64],
  [53, 57, 60],
  [60, 64, 67],
  [55, 59, 62],
];

const lovePlaylist = [
  {
    title: "Ngày Đầu Tiên",
    src: encodeURI("assets/music/Ngày Đầu Tiên.mp3"),
  },
  {
    title: "Nàng Thơ",
    src: encodeURI("assets/music/Nàng Thơ.mp3"),
  },
];

const letterVariants = {
  gentle: {
    eyebrow: "Một lời nhắn nhỏ",
    title: "Anh không muốn lỡ mất em.",
    paragraphs: [
      "Có những điều nếu cứ giữ mãi trong lòng thì sẽ thành tiếc nuối. Anh viết những dòng này chỉ vì không muốn bỏ lỡ một người khiến anh rung động theo cách rất dịu dàng.",
      "Anh quý cảm giác được nói chuyện với em, quý cả cách em làm những ngày bình thường trở nên dễ thương hơn rất nhiều. Anh chỉ muốn em biết rằng cảm xúc này không phải thoáng qua.",
    ],
    signoff: "Nếu em muốn, cho anh một cơ hội để bước gần em hơn nhé?",
    prompt: "Nếu em thấy thoải mái, mình cho nhau một cơ hội nhỏ để gần nhau hơn nhé?",
    yesLabel: "Em đồng ý",
    noLabel: "Em cần thêm thời gian",
    noTease: ["Khoan bấm vội nha", "Nghĩ lại chút đi mà"],
    yesReply: "Chỉ cần em gật đầu, anh sẽ trân trọng cơ hội này thật tử tế.",
    noReply: "Không sao đâu, anh vẫn cảm ơn em vì đã lắng nghe anh bằng sự chân thành.",
  },
  confession: {
    eyebrow: "Lời tỏ tình của anh",
    title: "Anh thích em. Không chỉ một chút.",
    paragraphs: [
      "Anh thích em theo cách rất rõ ràng: muốn được hỏi han em nhiều hơn, muốn trở thành người em có thể nghĩ đến khi vui, khi mệt, và cả khi chỉ cần một người ở cạnh.",
      "Anh không tìm một cảm xúc chóng qua. Điều anh muốn là một sự bắt đầu nghiêm túc, chậm thôi cũng được, miễn là thật lòng và đủ tử tế với trái tim của cả hai.",
      "Vậy nên hôm nay anh muốn nói thật: anh thích em, và anh mong mình có thể cho nhau một cơ hội để bước gần hơn, hiểu nhau hơn, rồi xem cảm xúc này có thể đẹp đến đâu.",
    ],
    signoff: "Em đồng ý cho anh được nghiêm túc bước vào thế giới của em nhé?",
    prompt: "Nếu em cũng có một chút rung động, mình thử bắt đầu với nhau nhé?",
    yesLabel: "Em đồng ý",
    noLabel: "Em chưa thể",
    noTease: ["Ơ kìa, suy nghĩ thêm nhé", "Đừng làm tim anh run vậy chứ"],
    yesReply: "Anh sẽ nhớ khoảnh khắc này rất lâu, và còn trân trọng em hơn nữa từ đây.",
    noReply: "Anh hiểu. Dù câu trả lời thế nào, anh vẫn thật lòng cảm ơn em vì đã để anh được nói ra.",
  },
  private: {
    eyebrow: "Bức thư riêng cho em",
    title: "Có những điều anh chỉ muốn nói rất khẽ với em thôi.",
    paragraphs: [
      "Nếu có một nơi nào đó trong anh luôn dịu lại mỗi khi nhớ tới, thì nơi đó mang tên em. Em đi vào lòng anh không ồn ào, nhưng đủ sâu để mỗi ngày anh đều thấy mình thương em thêm một chút.",
      "Anh thương cả những điều nhỏ nhặt ở em, thương cách em hiện diện trong suy nghĩ anh rất tự nhiên, thương cả cảm giác chỉ cần nhớ đến em thôi là những bộn bề cũng bỗng mềm đi rất nhiều.",
      "Anh không biết tương lai sẽ ra sao, nhưng anh biết nếu có một người anh muốn nghiêm túc tìm hiểu, muốn nắm tay thật cẩn thận và đồng hành bằng tất cả sự chân thành, thì người đó là em.",
      "Cho nên bức thư này không chỉ để nói rằng anh thích em. Nó là để nói rằng anh thương em, và anh muốn được yêu em theo một cách đàng hoàng, ấm áp và lâu dài nếu em cho phép.",
    ],
    signoff: "Dù câu trả lời là gì, anh vẫn cảm ơn em vì đã đọc đến tận dòng này.",
    prompt: "Nếu sau bức thư này em cũng muốn mở lòng với anh, em cho anh một cơ hội nhé?",
    yesLabel: "Em đồng ý",
    noLabel: "Cho em thêm thời gian",
    noTease: ["Khoan, đọc lại thư anh đi", "Cho anh hy vọng chút nha"],
    yesReply: "Anh sẽ giữ sự đồng ý này như một điều thật đẹp, và bắt đầu bằng tất cả sự nâng niu anh có.",
    noReply: "Anh sẽ không vội. Chỉ cần em biết rằng tình cảm này vẫn ở đây, rất thật và rất tôn trọng em.",
  },
};

function midiToFrequency(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

function updateMusicToggleUI() {
  if (!audioToggle || !audioToggleLabel) {
    return;
  }

  audioToggle.classList.toggle("is-playing", musicIsPlaying);
  audioToggle.setAttribute("aria-pressed", String(musicIsPlaying));
  audioToggle.setAttribute("aria-label", musicIsPlaying ? "Tắt nhạc nền" : "Bật nhạc nền");
  audioToggleLabel.textContent =
    musicIsPlaying && musicMode === "playlist" && activeTrackTitle ? activeTrackTitle : musicIsPlaying ? "Tắt nhạc" : "Bật nhạc";
  audioToggle.title =
    musicIsPlaying && musicMode === "playlist" && activeTrackTitle
      ? `Đang phát: ${activeTrackTitle}`
      : musicIsPlaying
        ? "Tắt nhạc nền"
        : "Bật nhạc nền";
}

function ensurePlaylistAudio() {
  if (!canUsePlaylistAudio) {
    return null;
  }

  if (!playlistAudio) {
    playlistAudio = new Audio();
    playlistAudio.preload = "auto";
    playlistAudio.loop = false;
    playlistAudio.volume = 0.56;
    playlistAudio.addEventListener("ended", () => {
      void playNextPlaylistTrack();
    });
  }

  return playlistAudio;
}

async function playPlaylistTrack(index) {
  const track = lovePlaylist[index];

  try {
    const audio = ensurePlaylistAudio();
    if (!track || !audio) {
      return false;
    }

    if (audio.dataset.trackIndex !== String(index)) {
      await new Promise((resolve, reject) => {
        let isSettled = false;

        const cleanup = () => {
          window.clearTimeout(timeoutId);
          audio.removeEventListener("canplay", handleReady);
          audio.removeEventListener("loadedmetadata", handleReady);
          audio.removeEventListener("error", handleError);
        };

        const handleReady = () => {
          if (isSettled) {
            return;
          }

          isSettled = true;
          cleanup();
          audio.dataset.trackIndex = String(index);
          resolve();
        };

        const handleError = () => {
          if (isSettled) {
            return;
          }

          isSettled = true;
          cleanup();
          reject(new Error(`Cannot load ${track.src}`));
        };

        const timeoutId = window.setTimeout(handleError, 5000);

        audio.addEventListener("canplay", handleReady);
        audio.addEventListener("loadedmetadata", handleReady);
        audio.addEventListener("error", handleError);
        audio.src = track.src;
        audio.load();
      });
    }

    audio.volume = 0.56;
    await audio.play();

    musicMode = "playlist";
    musicIsPlaying = true;
    musicUserStopped = false;
    currentTrackIndex = index;
    activeTrackTitle = track.title;
    updateMusicToggleUI();
    return true;
  } catch (error) {
    return false;
  }
}

async function startPlaylistMusic(startIndex = currentTrackIndex) {
  if (!lovePlaylist.length) {
    return false;
  }

  for (let offset = 0; offset < lovePlaylist.length; offset += 1) {
    const index = (startIndex + offset) % lovePlaylist.length;
    const started = await playPlaylistTrack(index);

    if (started) {
      return true;
    }
  }

  return false;
}

function stopPlaylistMusic() {
  if (!playlistAudio) {
    return;
  }

  playlistAudio.pause();
  playlistAudio.currentTime = 0;
  activeTrackTitle = "";
}

function ensureAudioEngine() {
  if (!AudioContextClass) {
    return false;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
    musicMasterGain = audioContext.createGain();
    musicMasterGain.gain.value = 0.0001;
    musicMasterGain.connect(audioContext.destination);
  }

  return true;
}

function createAmbientNote(
  frequency,
  startTime,
  duration,
  { volume = 0.02, type = "triangle", attack = 1.8, release = 2.4, detune = 0, cutoff = 1400 } = {},
) {
  if (!audioContext || !musicMasterGain) {
    return;
  }

  const oscillator = audioContext.createOscillator();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  const fadeStart = startTime + Math.max(duration - release, attack + 0.2);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  oscillator.detune.setValueAtTime(detune, startTime);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(cutoff, startTime);
  filter.Q.setValueAtTime(0.6, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, fadeStart + release);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(musicMasterGain);

  oscillator.start(startTime);
  oscillator.stop(fadeStart + release + 0.08);
}

function scheduleChord(chord, startTime, chordIndex) {
  const padDuration = 5.8;

  chord.forEach((note, noteIndex) => {
    const frequency = midiToFrequency(note);
    const detailDelay = noteIndex * 0.06;

    createAmbientNote(frequency, startTime + detailDelay, padDuration, {
      volume: 0.018 - noteIndex * 0.002,
      type: "triangle",
      attack: 1.9,
      release: 2.8,
      detune: noteIndex === 1 ? -5 : 4,
      cutoff: 1180 + noteIndex * 140,
    });

    createAmbientNote(frequency * 2, startTime + 0.28 + detailDelay, 3.8, {
      volume: 0.0055,
      type: "sine",
      attack: 0.9,
      release: 1.9,
      cutoff: 2600,
    });
  });

  createAmbientNote(midiToFrequency(chord[0] - 12), startTime, 6.2, {
    volume: 0.008,
    type: "sine",
    attack: 2.4,
    release: 2.9,
    cutoff: 680,
  });

  createAmbientNote(midiToFrequency(chord[1] + 12 + (chordIndex % 2)), startTime + 1.35, 2.4, {
    volume: 0.007,
    type: "sine",
    attack: 0.25,
    release: 1.6,
    cutoff: 3200,
  });
}

function clearMusicLoop() {
  if (musicLoopTimer) {
    window.clearTimeout(musicLoopTimer);
    musicLoopTimer = 0;
  }
}

function scheduleMusicLoop() {
  if (!musicIsPlaying || !audioContext) {
    return;
  }

  const chordLength = 5.7;
  const loopLead = audioContext.currentTime + 0.12;

  musicProgression.forEach((chord, chordIndex) => {
    scheduleChord(chord, loopLead + chordIndex * chordLength, chordIndex);
  });

  clearMusicLoop();
  musicLoopTimer = window.setTimeout(() => {
    musicLoopTimer = 0;
    scheduleMusicLoop();
  }, musicProgression.length * chordLength * 1000 - 320);
}

async function startBackgroundMusic() {
  if (musicIsPlaying) {
    return true;
  }

  musicUserStopped = false;

  const playlistStarted = await startPlaylistMusic(currentTrackIndex);
  if (playlistStarted) {
    return true;
  }

  return startAmbientMusic();
}

async function startAmbientMusic() {
  if (!ensureAudioEngine()) {
    return false;
  }

  try {
    if (audioContext?.state === "suspended") {
      await audioContext.resume();
    }
  } catch (error) {
    return false;
  }

  const now = audioContext.currentTime;
  musicIsPlaying = true;
  musicMode = "ambient";
  activeTrackTitle = "";

  musicMasterGain.gain.cancelScheduledValues(now);
  musicMasterGain.gain.setValueAtTime(Math.max(musicMasterGain.gain.value, 0.0001), now);
  musicMasterGain.gain.linearRampToValueAtTime(0.17, now + 1.6);

  scheduleMusicLoop();
  updateMusicToggleUI();
  return true;
}

function stopBackgroundMusic({ manual = true } = {}) {
  if (manual) {
    musicUserStopped = true;
  }

  stopPlaylistMusic();
  clearMusicLoop();
  musicIsPlaying = false;
  musicMode = "none";
  activeTrackTitle = "";

  if (audioContext && musicMasterGain) {
    const now = audioContext.currentTime;
    musicMasterGain.gain.cancelScheduledValues(now);
    musicMasterGain.gain.setValueAtTime(Math.max(musicMasterGain.gain.value, 0.0001), now);
    musicMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
  }

  updateMusicToggleUI();
}

async function playNextPlaylistTrack() {
  if (!musicIsPlaying || musicMode !== "playlist") {
    return false;
  }

  stopPlaylistMusic();
  musicIsPlaying = false;
  musicMode = "none";

  const started = await startPlaylistMusic(currentTrackIndex + 1);
  if (started) {
    return true;
  }

  return startAmbientMusic();
}

function isMusicToggleTarget(target) {
  return target instanceof Element && Boolean(target.closest("[data-audio-toggle]"));
}

function setupMusicAutoplay() {
  const removeIntentListeners = () => {
    window.removeEventListener("pointerdown", tryStartFromIntent);
    window.removeEventListener("touchstart", tryStartFromIntent);
    document.removeEventListener("keydown", tryStartFromKeydown);
  };

  const tryStartFromIntent = (event) => {
    if (musicIsPlaying || musicUserStopped || isMusicToggleTarget(event.target)) {
      return;
    }

    startBackgroundMusic().then((started) => {
      if (started) {
        removeIntentListeners();
      }
    });
  };

  const tryStartFromKeydown = (event) => {
    if (musicIsPlaying || musicUserStopped || isMusicToggleTarget(event.target)) {
      return;
    }

    if (event.key === "Tab" || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    startBackgroundMusic().then((started) => {
      if (started) {
        removeIntentListeners();
      }
    });
  };

  window.addEventListener("pointerdown", tryStartFromIntent, { passive: true });
  window.addEventListener("touchstart", tryStartFromIntent, { passive: true });
  document.addEventListener("keydown", tryStartFromKeydown);
}

function updateParallax() {
  parallaxItems.forEach((item) => {
    const factor = Number(item.dataset.parallax || 0);
    const offset = latestScroll * factor * -0.18;
    item.style.setProperty("--parallax-y", `${offset}px`);
  });
  ticking = false;
}

function requestParallaxUpdate() {
  latestScroll = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(updateParallax);
    ticking = true;
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        if (
          entry.target.classList.contains("tilt-card") &&
          !entry.target.classList.contains("reveal-settled")
        ) {
          window.setTimeout(() => {
            entry.target.classList.add("reveal-settled");
          }, 760);
        }
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  },
);

revealItems.forEach((item) => observer.observe(item));

window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
window.addEventListener("resize", requestParallaxUpdate);
requestParallaxUpdate();

window.addEventListener("pointermove", (event) => {
  if (!cursorGlow) {
    return;
  }

  cursorGlow.style.opacity = "1";
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

window.addEventListener("pointerleave", () => {
  if (cursorGlow) {
    cursorGlow.style.opacity = "0";
  }
});

function resetTilt(card) {
  card.style.setProperty("--tilt-x", "0deg");
  card.style.setProperty("--tilt-y", "0deg");
  card.style.setProperty("--tilt-shift-x", "0px");
  card.style.setProperty("--tilt-shift-y", "0px");
  card.style.setProperty("--tilt-scale", "1");
  card.style.setProperty("--depth-1-x", "0px");
  card.style.setProperty("--depth-1-y", "0px");
  card.style.setProperty("--depth-2-x", "0px");
  card.style.setProperty("--depth-2-y", "0px");
  card.style.setProperty("--depth-3-x", "0px");
  card.style.setProperty("--depth-3-y", "0px");
  card.style.setProperty("--shadow-x", "0px");
  card.style.setProperty("--shadow-y", "28px");
  card.style.setProperty("--shadow-blur", "44px");
  card.style.setProperty("--shine-opacity", "0");
  card.style.setProperty("--shine-x", "50%");
  card.style.setProperty("--shine-y", "50%");
}

function getTiltStrength(card) {
  if (card.classList.contains("heart-stage")) {
    return 1.45;
  }

  if (card.classList.contains("promise-shell")) {
    return 1.2;
  }

  if (card.classList.contains("glass-card")) {
    return 1.15;
  }

  return 1;
}

tiltCards.forEach((card) => {
  resetTilt(card);

  card.addEventListener("pointermove", (event) => {
    if (prefersReducedMotion.matches) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const strength = getTiltStrength(card);
    const offsetX = px - 0.5;
    const offsetY = py - 0.5;
    const rotateY = offsetX * 18 * strength;
    const rotateX = -offsetY * 16 * strength;
    const shiftX = offsetX * 14 * strength;
    const shiftY = offsetY * 14 * strength;
    const shadowX = offsetX * 22 * strength;
    const shadowY = 26 + (py * 12 + 8) * strength;
    const shadowBlur = 42 + (Math.abs(offsetX) + Math.abs(offsetY)) * 20;

    card.style.setProperty("--tilt-x", `${rotateX}deg`);
    card.style.setProperty("--tilt-y", `${rotateY}deg`);
    card.style.setProperty("--tilt-shift-x", `${shiftX}px`);
    card.style.setProperty("--tilt-shift-y", `${shiftY}px`);
    card.style.setProperty("--tilt-scale", `${1.01 + strength * 0.006}`);
    card.style.setProperty("--depth-1-x", `${offsetX * 8 * strength}px`);
    card.style.setProperty("--depth-1-y", `${offsetY * 8 * strength}px`);
    card.style.setProperty("--depth-2-x", `${offsetX * 14 * strength}px`);
    card.style.setProperty("--depth-2-y", `${offsetY * 14 * strength}px`);
    card.style.setProperty("--depth-3-x", `${offsetX * 20 * strength}px`);
    card.style.setProperty("--depth-3-y", `${offsetY * 20 * strength}px`);
    card.style.setProperty("--shadow-x", `${shadowX}px`);
    card.style.setProperty("--shadow-y", `${shadowY}px`);
    card.style.setProperty("--shadow-blur", `${shadowBlur}px`);
    card.style.setProperty("--shine-opacity", "1");
    card.style.setProperty("--shine-x", `${px * 100}%`);
    card.style.setProperty("--shine-y", `${py * 100}%`);
  });

  card.addEventListener("pointerleave", () => resetTilt(card));
  card.addEventListener("blur", () => resetTilt(card));
});

function renderLetter(mode = "gentle") {
  const variant = letterVariants[mode] || letterVariants.gentle;

  currentLetterMode = mode;
  letterModal?.setAttribute("data-letter-mode", mode);

  if (letterEyebrow) {
    letterEyebrow.textContent = variant.eyebrow;
  }

  if (letterTitle) {
    letterTitle.textContent = variant.title;
  }

  if (letterCopy) {
    letterCopy.innerHTML = "";
    variant.paragraphs.forEach((paragraph) => {
      const element = document.createElement("p");
      element.textContent = paragraph;
      letterCopy.appendChild(element);
    });
  }

  if (letterSignoff) {
    letterSignoff.textContent = variant.signoff;
  }

  if (letterPrompt) {
    letterPrompt.textContent = variant.prompt;
  }

  if (letterFeedback) {
    letterFeedback.textContent = "";
  }

  if (letterSheet) {
    letterSheet.scrollTop = 0;
  }

  answerButtons.forEach((button) => {
    button.classList.remove("is-selected");
    button.classList.remove("is-teasing");
    button.style.setProperty("--choice-x", "0px");
    button.style.setProperty("--choice-y", "0px");
    button.style.setProperty("--choice-rotate", "0deg");
    if (button.dataset.letterAnswer === "yes") {
      button.textContent = variant.yesLabel;
    } else {
      button.textContent = variant.noLabel;
    }
  });

  noButtonTeaseCount = 0;
}

function openLetter(mode = "gentle") {
  if (!letterModal) {
    return;
  }

  renderLetter(mode);
  lastFocusedElement = document.activeElement;
  letterModal.classList.add("is-open");
  letterModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  letterDialog?.focus();
}

function closeLetter() {
  if (!letterModal) {
    return;
  }

  letterModal.classList.remove("is-open");
  letterModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  lastFocusedElement?.focus?.();
}

function resetNoButtonTease(button) {
  const variant = letterVariants[currentLetterMode] || letterVariants.gentle;

  button.classList.remove("is-teasing");
  button.style.setProperty("--choice-x", "0px");
  button.style.setProperty("--choice-y", "0px");
  button.style.setProperty("--choice-rotate", "0deg");
  button.textContent = variant.noLabel;
}

function teaseNoButton(button) {
  if (prefersReducedMotion.matches || noButtonTeaseCount >= 2) {
    return;
  }

  const variant = letterVariants[currentLetterMode] || letterVariants.gentle;
  const teaseText = variant.noTease?.[noButtonTeaseCount];
  const direction = noButtonTeaseCount % 2 === 0 ? 1 : -1;
  const offsetX = direction * (14 + noButtonTeaseCount * 4);
  const offsetY = noButtonTeaseCount === 0 ? -4 : 6;

  noButtonTeaseCount += 1;
  button.classList.add("is-teasing");
  button.style.setProperty("--choice-x", `${offsetX}px`);
  button.style.setProperty("--choice-y", `${offsetY}px`);
  button.style.setProperty("--choice-rotate", `${direction * -3}deg`);

  if (teaseText) {
    button.textContent = teaseText;
  }
}

function createSparkBurst(event) {
  const centerX = event?.clientX || window.innerWidth / 2;
  const centerY = event?.clientY || window.innerHeight / 2;

  Array.from({ length: 8 }).forEach((_, index) => {
    const spark = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 8;
    const distance = 24 + Math.random() * 54;
    spark.className = "spark";
    spark.style.left = `${centerX}px`;
    spark.style.top = `${centerY}px`;
    spark.style.setProperty("--spark-x", `${Math.cos(angle) * distance}px`);
    spark.style.setProperty("--spark-y", `${Math.sin(angle) * distance}px`);
    document.body.appendChild(spark);
    window.setTimeout(() => spark.remove(), 760);
  });

  Array.from({ length: 8 }).forEach((_, index) => {
    const heart = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 8 + Math.random() * 0.22;
    const distance = 38 + Math.random() * 70;
    const glyphs = ["♡", "❤", "♥"];
    heart.className = "heart-particle";
    heart.textContent = glyphs[index % glyphs.length];
    heart.style.left = `${centerX}px`;
    heart.style.top = `${centerY}px`;
    heart.style.setProperty("--heart-x", `${Math.cos(angle) * distance}px`);
    heart.style.setProperty("--heart-y", `${Math.sin(angle) * distance - 16}px`);
    heart.style.setProperty("--heart-rotate", `${-24 + Math.random() * 48}deg`);
    document.body.appendChild(heart);
    window.setTimeout(() => heart.remove(), 1250);
  });
}

openButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    createSparkBurst(event);
    openLetter(button.dataset.openLetter || "gentle");
  });
});

closeButtons.forEach((button) => {
  button.addEventListener("click", closeLetter);
});

audioToggle?.addEventListener("click", async () => {
  if (musicIsPlaying) {
    stopBackgroundMusic();
    return;
  }

  await startBackgroundMusic();
});

answerButtons.forEach((button) => {
  if (button.dataset.letterAnswer === "no") {
    button.addEventListener("pointerenter", () => teaseNoButton(button));
    button.addEventListener("pointerleave", () => resetNoButtonTease(button));
    button.addEventListener("blur", () => resetNoButtonTease(button));
  }

  button.addEventListener("click", () => {
    const variant = letterVariants[currentLetterMode] || letterVariants.gentle;
    const isYes = button.dataset.letterAnswer === "yes";

    answerButtons.forEach((item) => item.classList.remove("is-selected"));

    if (isYes) {
      const noButton = Array.from(answerButtons).find(
        (item) => item.dataset.letterAnswer === "no",
      );
      if (noButton) {
        resetNoButtonTease(noButton);
      }
    } else {
      resetNoButtonTease(button);
    }

    button.classList.add("is-selected");

    if (letterFeedback) {
      letterFeedback.textContent = isYes ? variant.yesReply : variant.noReply;
    }
  });
});

heartStage?.addEventListener("click", (event) => {
  createSparkBurst(event);
});

if (!canUsePlaylistAudio && !AudioContextClass) {
  audioToggle?.setAttribute("hidden", "hidden");
} else {
  updateMusicToggleUI();
  setupMusicAutoplay();
}

renderLetter(currentLetterMode);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLetter();
  }
});
