/* =========================================
   MICHAEL ANDERSON PORTFOLIO
   NAVIGATION + RECOMMENDATIONS
========================================= */

/* =========================================
   FULL-SCREEN NAVIGATION
========================================= */

const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector("#site-menu");
const closeButton = document.querySelector(".menu-close");

let previousFocus = null;

function openMenu() {
  previousFocus = document.activeElement;

  menu.hidden = false;

  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute(
    "aria-label",
    "Close navigation menu"
  );

  document.body.classList.add("menu-open");

  closeButton.focus();
}

function closeMenu(restoreFocus = true) {
  menu.hidden = true;

  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute(
    "aria-label",
    "Open navigation menu"
  );

  document.body.classList.remove("menu-open");

  if (restoreFocus && previousFocus) {
    previousFocus.focus({ preventScroll: true });
  }
}

menuButton.addEventListener("click", () => {
  if (menu.hidden) {
    openMenu();
  } else {
    closeMenu();
  }
});

closeButton.addEventListener("click", () => {
  closeMenu();
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu(false);
  });
});

document.addEventListener("keydown", (event) => {
  if (menu.hidden) return;

  if (event.key === "Escape") {
    closeMenu();
    return;
  }

  if (event.key === "Tab") {
    const focusable = Array.from(
      menu.querySelectorAll(
        'a[href], button:not([disabled])'
      )
    );

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === first
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  }
});

/* =========================================
   FIVE RECOMMENDATIONS
========================================= */

const recommendations = [
  {
    category: "TECHNOLOGY LEADERSHIP",
    quote:
      "He built our Applications & Digital Development team from scratch, taking the initial brief as to how I expected it to add value to the Club and turned it into a function the wider organisation now genuinely relies on.",
    name: "Daniel Bailey",
    role: "Head of Technology, Newcastle United Football Club",
    relationship: "Former direct manager"
  },

  {
    category: "PEOPLE LEADERSHIP",
    quote:
      "What really sets Michael apart is his leadership style; he is highly personable and emotionally intelligent, and adapts his approach to suit the needs of different direct reports.",
    name: "Rachel Wilson",
    role: "IT Applications & Digital Development Manager, Newcastle United Football Club",
    relationship: "Former direct report"
  },

  {
    category: "COMMERCIAL LEADERSHIP",
    quote:
      "Michael is one of the most professional, detailed and well communicated people I have ever worked with in over 23 years and he would be a very valued team member in any business no matter what the industry.",
    name: "Martin Robinson",
    role: "Executive Leader, Golf, Leisure & Hospitality",
    relationship: "Former colleague"
  },

  {
    category: "RELATIONSHIPS & COLLABORATION",
    quote:
      "His technical knowledge is outstanding, as is his ability to build effective relationships that support proactive, collaborative delivery.",
    name: "Steve Swinyard",
    role: "Head of Safeguarding & Welfare, Newcastle United Football Club",
    relationship: "Former senior colleague"
  },

  {
    category: "PROJECT DELIVERY",
    quote:
      "During our time together at American Golf he managed a number of successful projects with tenacity, professionalism, courtesy and a solution-focused approach.",
    name: "Scott Taylor",
    role: "Marketing & CRM Director, American Golf",
    relationship: "Former senior colleague"
  }
];

/* =========================================
   CAROUSEL SETTINGS
========================================= */

const AUTO_INTERVAL = 6000;
const INTERACTION_PAUSE = 15000;
const FADE_DURATION = 250;
const SWIPE_THRESHOLD = 45;

let current = 0;

let autoTimer = null;
let resumeTimer = null;
let transitionTimer = null;
let transitionEndTimer = null;
let resizeTimer = null;

let isTransitioning = false;
let pauseUntil = 0;
let pointerOverCard = false;
let focusInsideCard = false;

let touchStartX = 0;
let touchStartY = 0;

const recommendationCard = document.querySelector(
  ".recommendation-card"
);

const dots = document.querySelector("#quote-dots");
const prevButton = document.querySelector("#prev-quote");
const nextButton = document.querySelector("#next-quote");

const quoteText = document.querySelector("#quote-text");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

/* =========================================
   CAROUSEL STYLING

   Added automatically by JavaScript.
   No CSS file changes required.
========================================= */

const carouselStyles = document.createElement("style");

carouselStyles.textContent = `
  .recommendation-card {
    display: flex;
    flex-direction: column;
    touch-action: pan-y;
    -webkit-user-select: none;
    user-select: none;
  }

  .recommendation-card .quote-person {
    margin-top: auto;
  }

  .recommendation-card blockquote {
    min-height: 0;
  }

  .recommendation-card {
    transition: opacity 250ms ease;
  }

  .recommendation-card.is-changing {
    opacity: 0;
  }

  .recommendation-card.is-swiping {
    cursor: grabbing;
  }

  .carousel-controls {
    min-height: 50px;
  }

  @media (prefers-reduced-motion: reduce) {
    .recommendation-card {
      transition: none !important;
    }
  }
`;

document.head.appendChild(carouselStyles);

/* =========================================
   RENDER RECOMMENDATION
========================================= */

function renderQuote() {
  const recommendation = recommendations[current];

  document.querySelector(".quote-category").textContent =
    recommendation.category;

  quoteText.textContent =
    recommendation.quote;

  document.querySelector("#quote-name").textContent =
    recommendation.name;

  document.querySelector("#quote-role").textContent =
    recommendation.role;

  document.querySelector("#quote-relationship").textContent =
    recommendation.relationship;

  document.querySelector("#quote-initials").textContent =
    recommendation.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("");

  const indicators = recommendations.map((_, index) => {
    const button = document.createElement("button");

    button.type = "button";

    button.setAttribute(
      "aria-label",
      `Show recommendation ${index + 1}`
    );

    button.setAttribute(
      "aria-pressed",
      String(index === current)
    );

    button.className =
      index === current ? "active" : "";

    button.addEventListener("click", () => {
      registerInteraction();
      changeQuote(index);
    });

    return button;
  });

  dots.replaceChildren(...indicators);

  prevButton.disabled = recommendations.length < 2;
  nextButton.disabled = recommendations.length < 2;
}

/* =========================================
   KEEP ALL CARDS THE SAME HEIGHT
========================================= */

function equaliseCardHeight() {
  if (isTransitioning) return;

  const savedIndex = current;

  recommendationCard.style.minHeight = "0px";

  const originalVisibility =
    recommendationCard.style.visibility;

  recommendationCard.style.visibility = "hidden";

  let tallest = 0;

  recommendations.forEach((_, index) => {
    current = index;

    renderQuote();

    const height =
      recommendationCard.getBoundingClientRect().height;

    tallest = Math.max(tallest, height);
  });

  current = savedIndex;

  renderQuote();

  recommendationCard.style.minHeight =
    `${Math.ceil(tallest)}px`;

  recommendationCard.style.visibility =
    originalVisibility;
}

/* =========================================
   CHANGE RECOMMENDATION
========================================= */

function changeQuote(index) {
  if (isTransitioning) return;

  const targetIndex =
    (index + recommendations.length) %
    recommendations.length;

  if (targetIndex === current) return;

  if (reducedMotion.matches) {
    current = targetIndex;
    renderQuote();
    return;
  }

  isTransitioning = true;

  recommendationCard.classList.add("is-changing");

  transitionTimer = setTimeout(() => {
    current = targetIndex;

    renderQuote();

    recommendationCard.classList.remove("is-changing");

    transitionEndTimer = setTimeout(() => {
      isTransitioning = false;
    }, FADE_DURATION);

  }, FADE_DURATION);
}

/* =========================================
   AUTOMATIC CYCLING
========================================= */

function stopAutoCycle() {
  if (autoTimer !== null) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

function canAutoCycle() {
  return (
    recommendations.length > 1 &&
    !document.hidden &&
    !reducedMotion.matches &&
    menu.hidden &&
    !pointerOverCard &&
    !focusInsideCard &&
    Date.now() >= pauseUntil
  );
}

function startAutoCycle() {
  stopAutoCycle();

  if (!canAutoCycle()) return;

  autoTimer = setInterval(() => {
    if (!canAutoCycle()) {
      stopAutoCycle();
      return;
    }

    if (!isTransitioning) {
      changeQuote(current + 1);
    }
  }, AUTO_INTERVAL);
}

/* =========================================
   PAUSE AFTER USER INTERACTION
========================================= */

function registerInteraction() {
  stopAutoCycle();

  pauseUntil = Date.now() + INTERACTION_PAUSE;

  if (resumeTimer !== null) {
    clearTimeout(resumeTimer);
  }

  resumeTimer = setTimeout(() => {
    startAutoCycle();
  }, INTERACTION_PAUSE + 50);
}

/* =========================================
   ARROW CONTROLS
========================================= */

prevButton.addEventListener("click", () => {
  registerInteraction();
  changeQuote(current - 1);
});

nextButton.addEventListener("click", () => {
  registerInteraction();
  changeQuote(current + 1);
});

/* =========================================
   SWIPE SUPPORT FOR IPHONE / ANDROID
========================================= */

recommendationCard.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length !== 1) return;

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  },
  { passive: true }
);

recommendationCard.addEventListener(
  "touchend",
  (event) => {
    if (event.changedTouches.length !== 1) return;

    const touchEndX =
      event.changedTouches[0].clientX;

    const touchEndY =
      event.changedTouches[0].clientY;

    const differenceX =
      touchEndX - touchStartX;

    const differenceY =
      touchEndY - touchStartY;

    /*
      Only treat a gesture as a swipe
      when horizontal movement is clearly
      greater than vertical movement.
    */

    if (
      Math.abs(differenceX) < SWIPE_THRESHOLD ||
      Math.abs(differenceX) <= Math.abs(differenceY)
    ) {
      return;
    }

    registerInteraction();

    if (differenceX < 0) {
      // Swipe left: next recommendation
      changeQuote(current + 1);
    } else {
      // Swipe right: previous recommendation
      changeQuote(current - 1);
    }
  },
  { passive: true }
);

/* =========================================
   DESKTOP MOUSE HOVER
========================================= */

recommendationCard.addEventListener(
  "mouseenter",
  () => {
    pointerOverCard = true;
    stopAutoCycle();
  }
);

recommendationCard.addEventListener(
  "mouseleave",
  () => {
    pointerOverCard = false;
    startAutoCycle();
  }
);

/* =========================================
   KEYBOARD FOCUS
========================================= */

recommendationCard.addEventListener(
  "focusin",
  () => {
    focusInsideCard = true;
    stopAutoCycle();
  }
);

recommendationCard.addEventListener(
  "focusout",
  (event) => {
    if (
      !recommendationCard.contains(event.relatedTarget)
    ) {
      focusInsideCard = false;
      startAutoCycle();
    }
  }
);

/* =========================================
   PAGE VISIBILITY
========================================= */

document.addEventListener(
  "visibilitychange",
  () => {
    if (document.hidden) {
      stopAutoCycle();
    } else {
      startAutoCycle();
    }
  }
);

/* =========================================
   REDUCED MOTION
========================================= */

function handleMotionPreference() {
  if (reducedMotion.matches) {
    stopAutoCycle();

    clearTimeout(transitionTimer);
    clearTimeout(transitionEndTimer);

    isTransitioning = false;

    recommendationCard.classList.remove(
      "is-changing"
    );
  } else {
    startAutoCycle();
  }
}

if (reducedMotion.addEventListener) {
  reducedMotion.addEventListener(
    "change",
    handleMotionPreference
  );
} else {
  reducedMotion.addListener(
    handleMotionPreference
  );
}

/* =========================================
   RECALCULATE HEIGHT WHEN SCREEN RESIZES
========================================= */

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    if (isTransitioning) {
      resizeTimer = setTimeout(
        equaliseCardHeight,
        FADE_DURATION * 2 + 100
      );
    } else {
      equaliseCardHeight();
    }
  }, 200);
});

/* =========================================
   INITIALISE
========================================= */

renderQuote();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    equaliseCardHeight();
  });
} else {
  equaliseCardHeight();
}

window.addEventListener("load", equaliseCardHeight);

startAutoCycle();
