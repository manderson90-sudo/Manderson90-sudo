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
  menuButton.setAttribute("aria-label", "Close navigation menu");

  document.body.classList.add("menu-open");

  closeButton.focus();
}

function closeMenu(restoreFocus = true) {
  menu.hidden = true;

  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation menu");

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

    if (event.shiftKey && document.activeElement === first) {
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
   RECOMMENDATIONS
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
const FADE_DURATION = 300;

let current = 0;

let autoTimer = null;
let interactionTimer = null;
let fadeTimer = null;

let carouselVisible = false;
let isTransitioning = false;
let userInteracting = false;

const recommendationCard = document.querySelector(
  ".recommendation-card"
);

const dots = document.querySelector("#quote-dots");
const prevButton = document.querySelector("#prev-quote");
const nextButton = document.querySelector("#next-quote");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

/* =========================================
   RENDER RECOMMENDATION
========================================= */

function renderQuote() {
  const recommendation = recommendations[current];

  document.querySelector(".quote-category").textContent =
    recommendation.category;

  document.querySelector("#quote-text").textContent =
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

    button.className = index === current ? "active" : "";

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
   FADE TRANSITION
========================================= */

recommendationCard.style.transition =
  `opacity ${FADE_DURATION}ms ease`;

function changeQuote(index) {
  if (isTransitioning) return;

  if (index === current) return;

  if (reducedMotion.matches) {
    current = index;
    renderQuote();
    return;
  }

  isTransitioning = true;

  recommendationCard.style.opacity = "0";

  fadeTimer = setTimeout(() => {
    current = index;

    renderQuote();

    recommendationCard.style.opacity = "1";

    fadeTimer = setTimeout(() => {
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

function startAutoCycle() {
  stopAutoCycle();

  if (
    recommendations.length < 2 ||
    !carouselVisible ||
    userInteracting ||
    reducedMotion.matches ||
    document.hidden
  ) {
    return;
  }

  autoTimer = setInterval(() => {
    if (!isTransitioning) {
      const nextIndex =
        (current + 1) % recommendations.length;

      changeQuote(nextIndex);
    }
  }, AUTO_INTERVAL);
}

/* =========================================
   USER INTERACTION
========================================= */

function registerInteraction() {
  userInteracting = true;

  stopAutoCycle();

  if (interactionTimer !== null) {
    clearTimeout(interactionTimer);
  }

  interactionTimer = setTimeout(() => {
    userInteracting = false;
    startAutoCycle();
  }, INTERACTION_PAUSE);
}

/* Previous recommendation */

prevButton.addEventListener("click", () => {
  registerInteraction();

  const previousIndex =
    (current - 1 + recommendations.length) %
    recommendations.length;

  changeQuote(previousIndex);
});

/* Next recommendation */

nextButton.addEventListener("click", () => {
  registerInteraction();

  const nextIndex =
    (current + 1) % recommendations.length;

  changeQuote(nextIndex);
});

/* Pause while the pointer is over the card */

recommendationCard.addEventListener(
  "mouseenter",
  () => {
    stopAutoCycle();
  }
);

recommendationCard.addEventListener(
  "mouseleave",
  () => {
    startAutoCycle();
  }
);

/* Pause while keyboard focus is inside */

recommendationCard.addEventListener(
  "focusin",
  () => {
    stopAutoCycle();
  }
);

recommendationCard.addEventListener(
  "focusout",
  () => {
    startAutoCycle();
  }
);

/* =========================================
   ONLY CYCLE WHEN VISIBLE
========================================= */

const carouselObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      carouselVisible = entry.isIntersecting;

      if (carouselVisible) {
        startAutoCycle();
      } else {
        stopAutoCycle();
      }
    });
  },
  {
    threshold: 0.35
  }
);

carouselObserver.observe(recommendationCard);

/* =========================================
   PAGE VISIBILITY
========================================= */

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAutoCycle();
  } else {
    startAutoCycle();
  }
});

/* =========================================
   ACCESSIBILITY
========================================= */

reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) {
    stopAutoCycle();

    clearTimeout(fadeTimer);

    isTransitioning = false;
    recommendationCard.style.opacity = "1";
  } else {
    startAutoCycle();
  }
});

/* =========================================
   INITIALISE
========================================= */

renderQuote();
