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
   RECOMMENDATIONS CAROUSEL
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
   CAROUSEL FUNCTIONALITY
========================================= */

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
      current = index;
      renderQuote();
    });

    return button;

  });

  dots.replaceChildren(...indicators);

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

/* Initialise carousel */

renderQuote();
