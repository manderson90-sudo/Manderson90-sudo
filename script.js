/* =========================================
   MICHAEL ANDERSON
   TECHNOLOGY LEADERSHIP PORTFOLIO

   Navigation + Recommendations Carousel
========================================= */


/* =========================================
   FULL-SCREEN NAVIGATION
========================================= */

const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector("#site-menu");
const closeButton = document.querySelector(".menu-close");

let previousFocus = null;

function openMenu() {
  if (!menu || !menuButton) return;

  previousFocus = document.activeElement;

  menu.hidden = false;

  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute(
    "aria-label",
    "Close navigation menu"
  );

  document.body.classList.add("menu-open");

  stopAutoCycle();

  if (closeButton) {
    closeButton.focus();
  }
}

function closeMenu(restoreFocus = true) {
  if (!menu || !menuButton) return;

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

  startAutoCycle();
}

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    if (menu.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });
}

if (closeButton) {
  closeButton.addEventListener("click", () => {
    closeMenu();
  });
}

if (menu) {
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu(false);
    });
  });
}

document.addEventListener("keydown", (event) => {
  if (!menu || menu.hidden) return;

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

    if (!focusable.length) return;

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
}


/* =========================================
   RECOMMENDATIONS
========================================= */

const recommendations = [
  {
    category: "TECHNOLOGY LEADERSHIP",
    quote:
      "He built our Applications & Digital Development team from scratch, taking the initial brief as to how I expected it to add value to the Club and turned it into a function the wider organisation now genuinely relies on.",
    name: "Daniel Bailey",
    role:
      "Head of Technology, Newcastle United Football Club",
    relationship: "Former direct manager"
  },

  {
    category: "PEOPLE LEADERSHIP",
    quote:
      "What really sets Michael apart is his leadership style; he is highly personable and emotionally intelligent, and adapts his approach to suit the needs of different direct reports.",
    name: "Rachel Wilson",
    role:
      "IT Applications & Digital Development Manager, Newcastle United Football Club",
    relationship: "Former direct report"
  },

  {
    category: "COMMERCIAL LEADERSHIP",
    quote:
      "Michael is one of the most professional, detailed and well communicated people I have ever worked with in over 23 years and he would be a very valued team member in any business no matter what the industry.",
    name: "Martin Robinson",
    role:
      "Executive Leader, Golf, Leisure & Hospitality",
    relationship: "Former colleague"
  },

  {
    category: "RELATIONSHIPS & COLLABORATION",
    quote:
      "His technical knowledge is outstanding, as is his ability to build effective relationships that support proactive, collaborative delivery.",
    name: "Steve Swinyard",
    role:
      "Head of Safeguarding & Welfare, Newcastle United Football Club",
    relationship: "Former senior colleague"
  },

  {
    category: "PROJECT DELIVERY",
    quote:
      "During our time together at American Golf he managed a number of successful projects with tenacity, professionalism, courtesy and a solution-focused approach.",
    name: "Scott Taylor",
    role:
      "Marketing & CRM Director, American Golf",
    relationship: "Former senior colleague"
  }
];


/* =========================================
   CAROUSEL ELEMENTS
========================================= */

const recommendationCard = document.querySelector(
  ".recommendation-card"
);

const quoteCategory = document.querySelector(
  ".quote-category"
);

const quoteText = document.querySelector("#quote-text");
const quoteName = document.querySelector("#quote-name");
const quoteRole = document.querySelector("#quote-role");

const quoteRelationship = document.querySelector(
  "#quote-relationship"
);

const quoteInitials = document.querySelector(
  "#quote-initials"
);

const dots = document.querySelector("#quote-dots");

const prevButton = document.querySelector("#prev-quote");
const nextButton = document.querySelector("#next-quote");


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
let fadeTimer = null;
let fadeEndTimer = null;
let resizeTimer = null;

let isTransitioning = false;

let pointerOverCard = false;
let focusInsideCard = false;

let pauseUntil = 0;

let touchStartX = 0;
let touchStartY = 0;
let touchTracking = false;

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const hasMouseHover = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
);


/* =========================================
   CAROUSEL STYLES

   These are applied automatically.
   No changes to styles.css required.
========================================= */

const carouselStyles = document.createElement("style");

carouselStyles.textContent = `

  .recommendation-card {
    display: flex;
    flex-direction: column;
    touch-action: pan-y;
    transition: opacity 250ms ease;
  }

  .recommendation-card.is-changing {
    opacity: 0;
  }

  .recommendation-card .quote-person {
    margin-top: auto;
  }

  .recommendation-card blockquote {
    min-height: 0;
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
  if (!recommendationCard) return;

  const recommendation = recommendations[current];

  quoteCategory.textContent = recommendation.category;

  quoteText.textContent = recommendation.quote;

  quoteName.textContent = recommendation.name;

  quoteRole.textContent = recommendation.role;

  quoteRelationship.textContent =
    recommendation.relationship;

  quoteInitials.textContent = recommendation.name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("");

  if (dots) {
    const indicators = recommendations.map((_, index) => {
      const button = document.createElement("button");

      button.type = "button";

      button.className =
        index === current ? "active" : "";

      button.setAttribute(
        "aria-label",
        `Show recommendation ${index + 1}`
      );

      button.setAttribute(
        "aria-pressed",
        String(index === current)
      );

      button.addEventListener("click", () => {
        registerInteraction();
        changeQuote(index);
      });

      return button;
    });

    dots.replaceChildren(...indicators);
  }
}


/* =========================================
   KEEP ALL CARDS THE SAME HEIGHT
========================================= */

function equaliseCardHeight() {
  if (!recommendationCard || isTransitioning) return;

  const originalIndex = current;

  const originalVisibility =
    recommendationCard.style.visibility;

  const originalTransition =
    recommendationCard.style.transition;

  recommendationCard.style.visibility = "hidden";
  recommendationCard.style.transition = "none";
  recommendationCard.style.minHeight = "0px";

  let tallestHeight = 0;

  recommendations.forEach((_, index) => {
    current = index;

    renderQuote();

    const height =
      recommendationCard.getBoundingClientRect().height;

    tallestHeight = Math.max(tallestHeight, height);
  });

  current = originalIndex;

  renderQuote();

  recommendationCard.style.minHeight =
    `${Math.ceil(tallestHeight)}px`;

  recommendationCard.style.visibility =
    originalVisibility;

  recommendationCard.style.transition =
    originalTransition;
}


/* =========================================
   CHANGE RECOMMENDATION
========================================= */

function changeQuote(index) {
  if (!recommendationCard) return;

  if (isTransitioning) return;

  const nextIndex =
    (index + recommendations.length) %
    recommendations.length;

  if (nextIndex === current) return;

  if (reducedMotion.matches) {
    current = nextIndex;
    renderQuote();
    return;
  }

  isTransitioning = true;

  recommendationCard.classList.add("is-changing");

  fadeTimer = setTimeout(() => {
    current = nextIndex;

    renderQuote();

    recommendationCard.classList.remove("is-changing");

    fadeEndTimer = setTimeout(() => {
      isTransitioning = false;
    }, FADE_DURATION);

  }, FADE_DURATION);
}


/* =========================================
   AUTOMATIC CYCLING

   Runs every 6 seconds.

   No intersection observer.
   No iPhone hover interference.
========================================= */

function stopAutoCycle() {
  if (autoTimer !== null) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

function canAutoCycle() {
  if (!recommendationCard) return false;

  if (recommendations.length < 2) return false;

  if (document.hidden) return false;

  if (reducedMotion.matches) return false;

  if (menu && !menu.hidden) return false;

  if (pointerOverCard) return false;

  if (focusInsideCard) return false;

  if (Date.now() < pauseUntil) return false;

  return true;
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
   PAUSE AFTER INTERACTION
========================================= */

function registerInteraction() {
  stopAutoCycle();

  pauseUntil = Date.now() + INTERACTION_PAUSE;

  if (resumeTimer !== null) {
    clearTimeout(resumeTimer);
  }

  resumeTimer = setTimeout(() => {
    startAutoCycle();
  }, INTERACTION_PAUSE + 100);
}


/* =========================================
   ARROW BUTTONS
========================================= */

if (prevButton) {
  prevButton.addEventListener("click", () => {
    registerInteraction();
    changeQuote(current - 1);
  });
}

if (nextButton) {
  nextButton.addEventListener("click", () => {
    registerInteraction();
    changeQuote(current + 1);
  });
}


/* =========================================
   SWIPE SUPPORT

   Swipe left = next
   Swipe right = previous

   Vertical scrolling remains enabled.
========================================= */

if (recommendationCard) {
  recommendationCard.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) {
        touchTracking = false;
        return;
      }

      touchTracking = true;

      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  recommendationCard.addEventListener(
    "touchend",
    (event) => {
      if (!touchTracking) return;

      touchTracking = false;

      if (event.changedTouches.length !== 1) return;

      const touchEndX =
        event.changedTouches[0].clientX;

      const touchEndY =
        event.changedTouches[0].clientY;

      const differenceX = touchEndX - touchStartX;
      const differenceY = touchEndY - touchStartY;

      const horizontalDistance =
        Math.abs(differenceX);

      const verticalDistance =
        Math.abs(differenceY);

      if (horizontalDistance < SWIPE_THRESHOLD) {
        return;
      }

      if (horizontalDistance <= verticalDistance) {
        return;
      }

      registerInteraction();

      if (differenceX < 0) {
        changeQuote(current + 1);
      } else {
        changeQuote(current - 1);
      }
    },
    { passive: true }
  );

  recommendationCard.addEventListener(
    "touchcancel",
    () => {
      touchTracking = false;
    },
    { passive: true }
  );
}


/* =========================================
   DESKTOP MOUSE HOVER

   IMPORTANT:
   Only enabled for actual mouse devices.

   iPhone touches will NOT pause the timer.
========================================= */

if (recommendationCard && hasMouseHover.matches) {
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
}


/* =========================================
   KEYBOARD ACCESSIBILITY
========================================= */

if (recommendationCard) {
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
        !recommendationCard.contains(
          event.relatedTarget
        )
      ) {
        focusInsideCard = false;
        startAutoCycle();
      }
    }
  );
}


/* =========================================
   PAGE VISIBILITY

   Stops cycling when Safari is in
   the background.

   Restarts when the user returns.
========================================= */

document.addEventListener(
  "visibilitychange",
  () => {
    if (document.hidden) {
      stopAutoCycle();
    } else {
      pointerOverCard = false;
      startAutoCycle();
    }
  }
);


/* =========================================
   REDUCED MOTION ACCESSIBILITY
========================================= */

function handleMotionPreference() {
  if (reducedMotion.matches) {
    stopAutoCycle();

    clearTimeout(fadeTimer);
    clearTimeout(fadeEndTimer);

    isTransitioning = false;

    if (recommendationCard) {
      recommendationCard.classList.remove(
        "is-changing"
      );
    }
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
   RECALCULATE HEIGHT ON RESIZE
========================================= */

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    if (isTransitioning) {
      resizeTimer = setTimeout(() => {
        equaliseCardHeight();
      }, FADE_DURATION * 2 + 100);
    } else {
      equaliseCardHeight();
    }
  }, 200);
});


/* =========================================
   INITIALISE CAROUSEL
========================================= */

if (recommendationCard) {
  renderQuote();

  equaliseCardHeight();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      equaliseCardHeight();
    });
  }

  window.addEventListener("load", () => {
    equaliseCardHeight();

    pointerOverCard = false;
    focusInsideCard = false;

    startAutoCycle();
  });

  /*
    Start immediately as well.

    This ensures the timer works whether
    the script loads before or after the
    page has finished loading.
  */

  startAutoCycle();
}

/* =========================================
   MOBILE MENU REPAIR
========================================= */

document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#site-menu");
  const closeButton = document.querySelector(".menu-close");

  if (!menuButton || !menu || !closeButton) return;

  // Replace the button to clear any previous click handlers.
  const newMenuButton = menuButton.cloneNode(true);
  menuButton.replaceWith(newMenuButton);

  const newCloseButton = closeButton.cloneNode(true);
  closeButton.replaceWith(newCloseButton);

  function openNavigation() {
    menu.hidden = false;
    document.body.classList.add("menu-open");
    newMenuButton.setAttribute("aria-expanded", "true");
  }

  function closeNavigation() {
    menu.hidden = true;
    document.body.classList.remove("menu-open");
    newMenuButton.setAttribute("aria-expanded", "false");
  }

  newMenuButton.addEventListener("click", function () {
    if (menu.hidden) {
      openNavigation();
    } else {
      closeNavigation();
    }
  });

  newCloseButton.addEventListener("click", closeNavigation);

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !menu.hidden) {
      closeNavigation();
    }
  });
});
