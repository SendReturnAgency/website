(() => {
  // Shared interactions: services, contact, photo lightbox and carousel.
  const serviceData = [
    {
      name: "Creative Consulting",
      lead: "We help brands identify where they can credibly participate in culture.",
      body: "From brand positioning and audience strategy to platform development and campaign architecture, we create clear roadmaps that transform business objectives into cultural relevance.",
      skills: [
        "Cultural strategy",
        "Brand positioning",
        "Platform development",
        "Creative direction",
        "Concept development",
        "Audience and community insights",
      ],
    },
    {
      name: "Cultural Marketing + Platforms",
      lead: "We believe one-off campaigns create moments. Platforms create movements.",
      body: "We develop long-term cultural ecosystems that allow brands to contribute meaningful value to communities while generating scalable content, partnerships and growth opportunities.",
      skills: [
        "Cultural platforms",
        "Community building",
        "Talent development programs",
        "Content ecosystems",
        "Creator activation",
        "Social-first storytelling",
      ],
    },
    {
      name: "Event Production",
      lead: "Experiences are where culture becomes tangible.",
      body: "From exclusive invite-only gatherings to large-scale public activations, we create events that generate both real-world engagement and digital amplification. Every experience is designed to become a story worth sharing.",
      skills: [
        "Event concepting",
        "Full-service production",
        "Experience design",
        "Talent booking",
        "Guest management",
        "Content capture and distribution",
      ],
    },
    {
      name: "Brand + Media Partnerships",
      lead: "Culture grows through meaningful collaboration.",
      body: "We connect brands with artists, creators, venues, festivals, communities, media and organisations that bring credibility, relevance and reach. Our focus is not on sponsorships. It's on creating partnerships that add genuine value to everyone involved.",
      skills: [
        "Partnership strategy",
        "Talent partnerships",
        "Media strategy",
        "Editorial partnerships",
        "Community collaborations",
        "Brand integrations",
        "Ambassador programs",
      ],
    },
  ];
  const buttons = [...document.querySelectorAll(".service")],
    detail = document.querySelector(".service-detail");
  let active = null;
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
      if (matchMedia("(max-width:700px)").matches)
        detail.scrollIntoView({
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
      const subject = `Send Return enquiry — ${data.get("name")}`;
      const body = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`;
      window.location.href = `mailto:booking@sendreturn.ch?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      document.querySelector(".form-status").textContent =
        "Your email draft is ready in your email app. Please send it there, or contact booking@sendreturn.ch directly.";
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
