(() => {
  // Shared interactions: services, contact, photo lightbox and carousel.
  const serviceData = [
  {
    "name": "Strategie & Beratung",
    "lead": "Wir finden heraus, wo deine Marke glaubwürdig Teil der Kultur werden kann.",
    "body": "Wir schärfen die Positionierung, verstehen die Zielgruppe und entwickeln daraus konkrete Formate und Kampagnen. So wird aus einem unternehmerischen Ziel ein Vorhaben, das zur Marke und zur Szene passt.",
    "skills": [
      "Kulturstrategie",
      "Markenpositionierung",
      "Plattformentwicklung",
      "Kreative Leitung",
      "Konzeption",
      "Zielgruppen und Communitys"
    ]
  },
  {
    "name": "Kulturmarketing & Plattformen",
    "lead": "Wir entwickeln Formate, die über eine einzelne Kampagne hinausgehen.",
    "body": "Mit wiederkehrenden Veranstaltungen, Förderprogrammen und Content-Formaten schaffen wir Anlässe für langfristige Beziehungen. Die Marke leistet einen Beitrag, während Inhalte und Partnerschaften aus dem gemeinsamen Tun entstehen.",
    "skills": [
      "Kulturelle Plattformen",
      "Community-Aufbau",
      "Talentförderung",
      "Content-Formate",
      "Zusammenarbeit mit Creators",
      "Inhalte für Social Media"
    ]
  },
  {
    "name": "Events & Produktion",
    "lead": "Wir bringen Menschen zusammen und kümmern uns um die Umsetzung.",
    "body": "Vom Auftritt im kleinen Kreis bis zur öffentlichen Veranstaltung: Wir entwickeln das Konzept, planen die Produktion und begleiten das Erlebnis vor Ort. Foto und Video denken wir von Anfang an mit, damit die Veranstaltung auch danach Menschen erreicht.",
    "skills": [
      "Eventkonzeption",
      "Gesamtproduktion",
      "Erlebnisgestaltung",
      "Artist Booking",
      "Gästemanagement",
      "Foto- und Videoproduktion",
      "Verbreitung der Inhalte"
    ]
  },
  {
    "name": "Marken- & Medienpartnerschaften",
    "lead": "Wir bringen Partner zusammen, die inhaltlich zueinander passen.",
    "body": "Wir verbinden Marken mit Artists, Creators, Veranstaltungsorten, Festivals, Communitys und Medien. Gemeinsam entwickeln wir Kooperationen, in denen jeder Partner etwas beiträgt und von der Zusammenarbeit profitiert.",
    "skills": [
      "Partnerschaftsstrategie",
      "Artist-Kooperationen",
      "Medienstrategie",
      "Redaktionelle Kooperationen",
      "Zusammenarbeit mit Communitys",
      "Markenintegration",
      "Ambassador-Programme"
    ]
  }
];
  const buttons = [...document.querySelectorAll(".service")],
    detail = document.querySelector(".service-detail");
  const mobileServices = matchMedia("(max-width:700px)");
  const detailHome = detail ? document.createComment("Service detail desktop position") : null;
  if (detail) detail.before(detailHome);
  let active = null;
  function positionServiceDetail() {
    if (!detail) return;
    if (mobileServices.matches && active !== null) {
      buttons[active].insertAdjacentElement("afterend", detail);
    } else {
      detailHome.after(detail);
    }
  }
  mobileServices.addEventListener("change", positionServiceDetail);
  function closeService() {
    if (!detail) return;
    detail.hidden = true;
    buttons.forEach((b) => {
      b.setAttribute("aria-expanded", "false");
      b.querySelector(".plus").textContent = "+";
    });
    active = null;
  }
  buttons.forEach((button, i) =>
    button.addEventListener("click", () => {
      if (active === i) {
        closeService();
        return;
      }
      closeService();
      active = i;
      positionServiceDetail();
      const d = serviceData[i];
      button.setAttribute("aria-expanded", "true");
      button.querySelector(".plus").textContent = "−";
      detail.querySelector(".eyebrow").textContent = `0${i + 1} / ${d.name}`;
      detail.querySelector("h3").textContent = d.lead;
      detail.querySelector(".detail-body").textContent = d.body;
      const ul = detail.querySelector("ul");
      ul.replaceChildren(
        ...d.skills.map((s) => {
          const li = document.createElement("li");
          li.textContent = s;
          return li;
        }),
      );
      detail.hidden = false;
      if (mobileServices.matches)
        button.scrollIntoView({
          block: "start",
          behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
            ? "instant"
            : "smooth",
        });
    }),
  );
  document.querySelector(".close-detail")?.addEventListener("click", () => {
    const old = active;
    closeService();
    if (old !== null) buttons[old].focus();
  });
  document
    .querySelector(".contact-form")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      // Resolve Creative from the current page too, so older cached HTML and
      // agency-transition snapshots still use the correct contact address.
      const isCreative =
        /\/creative(?:\.html)?\/?$/.test(window.location.pathname) ||
        /\/creative-agency\/?$/.test(window.location.pathname);
      const recipient = isCreative
        ? "hello@sendreturn.ch"
        : form.dataset.recipient || "bookings@sendreturn.ch";
      const subject = `Anfrage an Send Return — ${data.get("name")}`;
      const body = `Name: ${data.get("name")}\nE-Mail: ${data.get("email")}\n\n${data.get("message")}`;
      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      document.querySelector(".form-status").textContent =
        `Dein E-Mail-Entwurf ist bereit. Bitte sende ihn in deinem E-Mail-Programm ab oder schreibe direkt an ${recipient}.`;
    });
  // Photo lightbox and shared dialog controls.
  const lightbox = document.querySelector("#lightbox");
  document.querySelectorAll("[data-photo]").forEach((b) =>
    b.addEventListener("click", () => {
      lightbox.querySelector("img").src = b.dataset.photo;
      lightbox.querySelector("img").alt = b.querySelector("img").alt;
      lightbox.showModal();
    }),
  );
  document.querySelectorAll("dialog").forEach((d) => {
    d.querySelector(".dialog-close").addEventListener("click", () => d.close());
    d.addEventListener("click", (e) => {
      if (e.target === d) {
        const r = d.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          d.close();
      }
    });
  });

  document.querySelectorAll(".case-carousel").forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track"),
      slides = [...track.children],
      count = carousel.querySelector(".carousel-count");
    let current = 0;
    const reduce = matchMedia("(prefers-reduced-motion:reduce)");
    function go(delta) {
      const next = (current + delta + slides.length) % slides.length;
      track.scrollTo({
        left: slides[next].offsetLeft - slides[0].offsetLeft,
        behavior: reduce.matches ? "instant" : "smooth",
      });
    }
    carousel
      .querySelector("[data-carousel-prev]")
      .addEventListener("click", () => go(-1));
    carousel
      .querySelector("[data-carousel-next]")
      .addEventListener("click", () => go(1));
    track.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        go(event.key === "ArrowRight" ? 1 : -1);
      }
    });
    track.addEventListener(
      "scroll",
      () => {
        current = slides.reduce(
          (best, slide, i) =>
            Math.abs(
              slide.offsetLeft - slides[0].offsetLeft - track.scrollLeft,
            ) <
            Math.abs(
              slides[best].offsetLeft - slides[0].offsetLeft - track.scrollLeft,
            )
              ? i
              : best,
          0,
        );
        count.textContent = current + 1 + " / " + slides.length;
      },
      { passive: true },
    );
  });
})();
