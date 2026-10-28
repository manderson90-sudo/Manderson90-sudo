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

/* Close menu when a navigation link is selected */

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu(false);
  });
});

/* Close menu using Escape */

document.addEventListener("keydown", (event) => {
  if (menu.hidden) return;

  if (event.key === "Escape") {
    closeMenu();
    return;
  }

  /* Keep keyboard focus inside the open menu */

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
   LINKEDIN RECOMMENDATIONS
========================================= */

/*
  Additional recommendations can be added
  once their exact wording and attribution
  have been confirmed.
*/

const recommendations = [
  {
    category: "TECHNOLOGY LEADERSHIP",
    quote:
      "He built our Applications & Digital Development team from scratch, taking the initial brief as to how I expected it to add value to the Club and turned it into a function the wider organisation now genuinely relies on.",
    name: "Daniel Bailey",
    role: "Head of Technology, Newcastle United Football Club",
    relationship: "Former direct manager"
  }
];

let current = 0;

const dots = document.querySelector("#quote-dots");
const prevButton = document.querySelector("#prev-quote");
const nextButton = document.querySelector("#next-quote");

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

  /* Create carousel position indicators */

  const indicators = recommendations.map((_, index) => {
    const button = document.createElement("button");

    button.type = "button";

    button.setAttribute(
      "aria-label",
      `Show recommendation ${index + 1}`
    );

    button.className =
      index === current ? "active" : "";

    button.addEventListener("click", () => {
      current = index;
      renderQuote();
    });

    return button;
  });

  dots.replaceChildren(...indicators);

  /* Disable arrows when only one recommendation exists */

  prevButton.disabled = recommendations.length < 2;
  nextButton.disabled = recommendations.length < 2;
}

/* Previous recommendation */

prevButton.addEventListener("click", () => {
  current =
    (current - 1 + recommendations.length) %
    recommendations.length;

  renderQuote();
});

/* Next recommendation */

nextButton.addEventListener("click", () => {
  current = (current + 1) % recommendations.length;

  renderQuote();
});

/* Initialise recommendations */

renderQuote();
