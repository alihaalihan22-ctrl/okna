const heroSlides = document.querySelectorAll(".hero-slide");
let heroIndex = 0;

setInterval(() => {
  heroSlides[heroIndex].classList.remove("active");
  heroIndex = (heroIndex + 1) % heroSlides.length;
  heroSlides[heroIndex].classList.add("active");
}, 5200);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const counters = document.querySelectorAll("[data-counter]");
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.counter);
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.floor(target * eased).toLocaleString("ru-RU");
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    counterObserver.unobserve(element);
  });
}, { threshold: 0.5 });

counters.forEach((counter) => counterObserver.observe(counter));

const audioContext = { ctx: null };

function playTone(frequency = 560, duration = 0.055, type = "sine", gain = 0.025) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioContext.ctx = audioContext.ctx || new AudioContext();
  const ctx = audioContext.ctx;
  const oscillator = ctx.createOscillator();
  const volume = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  volume.gain.setValueAtTime(gain, ctx.currentTime);
  volume.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  oscillator.connect(volume).connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

document.querySelectorAll(".sound-click").forEach((element) => {
  element.addEventListener("click", () => playTone(640, 0.05, "triangle", 0.018));
});

const compare = document.querySelector("[data-compare]");
const compareInput = compare.querySelector("input");
const afterImage = compare.querySelector(".after");
const cleanLayer = compare.querySelector(".clean-layer");
const dirtLayer = compare.querySelector(".dirt-layer");

function updateCompare(value) {
  compare.style.setProperty("--split", `${value}%`);
  afterImage.style.clipPath = `inset(0 0 0 ${value}%)`;
  cleanLayer.style.clipPath = `inset(0 0 0 ${value}%)`;
  dirtLayer.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
}

compareInput.addEventListener("input", (event) => updateCompare(event.target.value));
updateCompare(compareInput.value);

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
    title: "Панорамные окна",
    text: "больше света и чистый вид из квартиры"
  },
  {
    src: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=900&q=80",
    title: "Чистое стекло",
    text: "ровный блеск без мутной пленки"
  },
  {
    src: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80",
    title: "Светлый интерьер",
    text: "окна визуально освежают всю комнату"
  },
  {
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    title: "Стекло без разводов",
    text: "чистая прозрачность для дома и офиса"
  }
];

const galleryImage = document.querySelector("#galleryImage");
const galleryCaption = document.querySelector("#galleryCaption");
const galleryCaptionText = document.querySelector(".gallery-caption span");
const galleryPrev = document.querySelector(".slider-btn.prev");
const galleryNext = document.querySelector(".slider-btn.next");
let galleryIndex = 0;

function setGalleryImage(direction = 1) {
  galleryImage.style.opacity = "0";
  setTimeout(() => {
    galleryIndex = (galleryIndex + direction + galleryImages.length) % galleryImages.length;
    galleryImage.src = galleryImages[galleryIndex].src;
    galleryCaption.textContent = galleryImages[galleryIndex].title;
    galleryCaptionText.textContent = galleryImages[galleryIndex].text;
    galleryImage.style.opacity = "1";
  }, 180);
  playTone(420, 0.055, "triangle", 0.016);
}

galleryPrev.addEventListener("click", () => setGalleryImage(-1));
galleryNext.addEventListener("click", () => setGalleryImage(1));

document.querySelector("#gallery").addEventListener("mouseenter", () => {
  playTone(510, 0.045, "sine", 0.01);
}, { once: true });

const reviews = [
  {
    text: "Окна в Ortau стали идеально прозрачными. Приехали вовремя, все сделали аккуратно и без запаха химии.",
    name: "Алия, ЖК Ortau"
  },
  {
    text: "Заказывали тариф на все окна квартиры. Отмыли так, будто стекла только установили.",
    name: "Данияр, Алматы"
  },
  {
    text: "Очень спокойный премиальный сервис: чисто, пунктуально, без лишнего шума. Рекомендую соседям.",
    name: "Мадина, ЖК Ortau"
  }
];

const reviewText = document.querySelector("#reviewText");
const reviewName = document.querySelector("#reviewName");
const reviewForm = document.querySelector("#reviewForm");
const reviewAuthor = document.querySelector("#reviewAuthor");
const reviewBody = document.querySelector("#reviewBody");
const reviewPhoto = document.querySelector("#reviewPhoto");
const reviewVideo = document.querySelector("#reviewVideo");
const savedReviews = document.querySelector("#savedReviews");
const reviewStatus = document.querySelector("#reviewStatus");
const recordAudioButton = document.querySelector("#recordAudio");
const audioStatus = document.querySelector("#audioStatus");
const audioRecorder = document.querySelector(".audio-recorder");
const STORAGE_KEY = "clean-windows-ortau-reviews";
let recordedAudio = "";
let mediaRecorder = null;
let audioChunks = [];
let reviewIndex = 0;

function loadSavedReviews() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveReviews(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function fileToDataUrl(file) {
  if (!file) return Promise.resolve("");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderSavedReviews() {
  const items = loadSavedReviews();
  savedReviews.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "saved-review";

    const body = document.createElement("div");
    body.className = "saved-review-body";
    const stars = document.createElement("div");
    stars.className = "stars";
    stars.textContent = "★★★★★";
    const title = document.createElement("h4");
    title.textContent = item.name;
    const text = document.createElement("p");
    text.textContent = item.text;
    body.append(stars, title, text);
    card.append(body);

    if (item.photo) {
      const img = document.createElement("img");
      img.src = item.photo;
      img.alt = "Фото из отзыва";
      card.append(img);
    }

    if (item.video) {
      const video = document.createElement("video");
      video.src = item.video;
      video.controls = true;
      video.playsInline = true;
      card.append(video);
    }

    if (item.audio) {
      const audio = document.createElement("audio");
      audio.src = item.audio;
      audio.controls = true;
      card.append(audio);
    }

    savedReviews.prepend(card);
  });
}

function addReviewToCarousel(item) {
  reviews.push({ text: item.text, name: item.name });
}

loadSavedReviews().forEach(addReviewToCarousel);
renderSavedReviews();

setInterval(() => {
  reviewIndex = (reviewIndex + 1) % reviews.length;
  reviewText.animate([
    { opacity: 1, transform: "translateY(0)" },
    { opacity: 0, transform: "translateY(8px)" }
  ], { duration: 170, fill: "forwards" }).onfinish = () => {
    reviewText.textContent = reviews[reviewIndex].text;
    reviewName.textContent = reviews[reviewIndex].name;
    reviewText.animate([
      { opacity: 0, transform: "translateY(8px)" },
      { opacity: 1, transform: "translateY(0)" }
    ], { duration: 260, fill: "forwards" });
  };
}, 4300);

recordAudioButton.addEventListener("click", async () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    return;
  }

  if (!navigator.mediaDevices || !window.MediaRecorder) {
    audioStatus.textContent = "Запись аудио не поддерживается в этом браузере.";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size) audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onload = () => {
        recordedAudio = reader.result;
        audioStatus.textContent = "Аудио записано";
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach((track) => track.stop());
      audioRecorder.classList.remove("recording");
      recordAudioButton.textContent = "Записать аудио";
      playTone(960, 0.09, "sine", 0.026);
    });

    mediaRecorder.start();
    audioRecorder.classList.add("recording");
    recordAudioButton.textContent = "Остановить запись";
    audioStatus.textContent = "Идет запись...";
    playTone(700, 0.06, "triangle", 0.018);
  } catch {
    audioStatus.textContent = "Разрешите доступ к микрофону и попробуйте еще раз.";
  }
});

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  reviewStatus.textContent = "Сохраняем отзыв...";

  try {
    const item = {
      name: reviewAuthor.value.trim() || "Клиент ЖК Ortau",
      text: reviewBody.value.trim(),
      photo: await fileToDataUrl(reviewPhoto.files[0]),
      video: await fileToDataUrl(reviewVideo.files[0]),
      audio: recordedAudio,
      createdAt: new Date().toISOString()
    };

    const items = loadSavedReviews();
    items.push(item);
    saveReviews(items);
    addReviewToCarousel(item);
    renderSavedReviews();
    reviewForm.reset();
    recordedAudio = "";
    audioStatus.textContent = "Аудио не записано";
    reviewStatus.textContent = "Отзыв сохранен на этом устройстве.";
    playTone(920, 0.09, "sine", 0.032);
    setTimeout(() => playTone(1220, 0.08, "sine", 0.024), 95);
  } catch {
    reviewStatus.textContent = "Видео или аудио слишком тяжелое. Попробуйте короткий ролик.";
  }
});

window.addEventListener("scroll", () => {
  const offset = window.scrollY * 0.12;
  document.querySelector(".hero-media").style.transform = `translateY(${offset}px)`;
}, { passive: true });

const copilotToggle = document.querySelector("#copilotToggle");
const copilotWindow = document.querySelector("#copilotWindow");
const copilotClose = document.querySelector("#copilotClose");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatLog = document.querySelector("#chatLog");
const chatSuggestions = document.querySelectorAll("[data-question]");
const scanGlass = document.querySelector("#scanGlass");
const scanTitle = document.querySelector("#scanTitle");
const scanText = document.querySelector("#scanText");
const scanButtons = document.querySelectorAll("[data-scan]");

const scanStates = {
  light: {
    title: "Слегка мутные окна",
    text: "Достаточно стандартной мойки: убираем пленку, следы пыли и возвращаем стеклу прозрачность.",
    dirt: 0.2
  },
  medium: {
    title: "Пятна и пыль заметны",
    text: "Нужна более внимательная очистка загрязнений. После мойки окно станет заметно светлее и чище.",
    dirt: 0.46
  },
  heavy: {
    title: "Сильно грязные окна",
    text: "Если загрязнений много, выгоднее тариф «Все окна квартиры» за 7490 ₸. Для одного окна есть тариф 4590 ₸.",
    dirt: 0.78
  }
};

function updateScan(level) {
  const state = scanStates[level] || scanStates.light;
  scanGlass.className = `scan-glass ${level}`;
  scanGlass.style.setProperty("--scan-dirt", state.dirt);
  scanTitle.textContent = state.title;
  scanText.textContent = state.text;
  scanButtons.forEach((button) => button.classList.toggle("active", button.dataset.scan === level));
}

scanButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateScan(button.dataset.scan);
    playTone(690, 0.05, "triangle", 0.016);
  });
});

updateScan("light");

copilotToggle.addEventListener("click", () => {
  copilotWindow.classList.toggle("open");
  if (copilotWindow.classList.contains("open")) chatInput.focus();
});

copilotClose.addEventListener("click", () => copilotWindow.classList.remove("open"));

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.textContent = text;
  chatLog.append(message);
  chatLog.scrollTop = chatLog.scrollHeight;
  return message;
}

function getCopilotAnswer(question) {
  const q = question.toLowerCase();
  if (q.includes("сто") || q.includes("цен") || q.includes("сколько")) {
    return "Одно окно стоит 4590 ₸, все окна квартиры — 7490 ₸.";
  }
  if (q.includes("выбрать") || q.includes("какой")) {
    return "Если нужно помыть одно окно — выбирайте тариф 4590 ₸. Если нужно сразу всю квартиру, выгоднее тариф «Все окна квартиры» за 7490 ₸.";
  }
  if (q.includes("развод") || q.includes("гряз") || q.includes("мутн")) {
    return "Для мутных и грязных окон подойдет любой тариф: одно окно — 4590 ₸, все окна квартиры — 7490 ₸. После мойки стекло станет заметно прозрачнее.";
  }
  if (q.includes("уход") || q.includes("энерг") || q.includes("свет")) {
    return "Чистые окна пропускают больше света и визуально освежают квартиру. Чтобы эффект держался дольше, не трите стекло сухой грубой тканью.";
  }
  if (q.includes("входит") || q.includes("тариф") || q.includes("стандарт")) {
    return "В тарифы входят очистка загрязнений, аккуратная работа и блеск без разводов. Можно выбрать одно окно за 4590 ₸ или все окна квартиры за 7490 ₸.";
  }
  if (q.includes("ai") || q.includes("ии") || q.includes("оцен")) {
    return "На сайте есть AI-оценка загрязнения: выберите состояние окна, и блок подскажет, какой результат ожидать.";
  }
  if (q.includes("отзыв") || q.includes("фото") || q.includes("видео") || q.includes("аудио")) {
    return "В блоке «Отзывы» можно написать отзыв, снять фото или видео окна и записать аудио. После сохранения отзыв появится на странице и останется в этом браузере.";
  }
  if (q.includes("жк") || q.includes("ortau") || q.includes("ортау")) {
    return "Мы работаем по ЖК Ortau и рядом по Алматы. Можно написать в WhatsApp или позвонить.";
  }
  if (q.includes("заказ") || q.includes("заказать") || q.includes("заяв")) {
    return "Для связи нажмите кнопку WhatsApp или быстрый звонок. Формы бронирования на сайте нет.";
  }
  if (q.includes("время") || q.includes("долго") || q.includes("заним")) {
    return "Обычно мойка занимает один день. Точное время зависит от количества окон и загрязнений.";
  }
  if (q.includes("тел") || q.includes("звон")) {
    return "Позвоните по номеру +7 747 363 62 39 или нажмите кнопку быстрого звонка на сайте.";
  }
  return "Я помогу с ценами 4590 ₸ за одно окно и 7490 ₸ за все окна квартиры, составом работ, временем мойки и AI-оценкой.";
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = chatInput.value.trim();
  if (!question) return;
  addMessage(question, "user");
  chatInput.value = "";
  playTone(760, 0.045, "triangle", 0.016);
  const typing = addMessage("AI печатает...", "bot typing");
  setTimeout(() => {
    typing.textContent = getCopilotAnswer(question);
    typing.classList.remove("typing");
    playTone(560, 0.06, "sine", 0.014);
  }, 520);
});

chatSuggestions.forEach((button) => {
  button.addEventListener("click", () => {
    chatInput.value = button.dataset.question;
    chatForm.requestSubmit();
  });
});
