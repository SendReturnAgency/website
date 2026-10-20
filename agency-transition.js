/* Creative ↔ Artist transition. Ordinary links remain the non-JavaScript fallback. */
(() => {
  const pages = window.SendReturnAgencyPages;
  if (!pages) return;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let switching = false;

  function pageName(url) {
    return (
      new URL(url, location.href).pathname.split("/").pop() || "index.html"
    );
  }

  function reloadScript(source) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = source;
      script.onload = () => {
        script.remove();
        resolve();
      };
      script.onerror = () => {
        script.remove();
        reject(new Error(source));
      };
      document.head.append(script);
    });
  }

  async function navigate(url, updateHistory = true) {
    const name = pageName(url);
    if (name === "index.html") {
      location.assign(url);
      return;
    }
    if (switching || !pages[name]) return;
    switching = true;
    const oldHero = document.querySelector(".hero");
    const transfer = oldHero?.transferAgencyScene;
    const page = pages[name];
    const next = new DOMParser().parseFromString(page.body, "text/html");

    try {
      // Keep the existing renderer alive while the page content changes.
      if (!transfer)
        window.dispatchEvent(new Event("sendreturn:before-page-swap"));
      document.body.className = page.bodyClass;
      document.body.replaceChildren(...next.body.childNodes);
      document.querySelector(".hero-copy")?.classList.add("agency-arrival");
      const movement = transfer
        ? transfer(document.querySelector(".hero"), name)
        : null;
      document.title = page.title;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.content = page.description;
      if (updateHistory) history.pushState({ agency: name }, "", url);
      window.scrollTo({ top: 0, behavior: "instant" });

      await reloadScript("app.js");
      if (name === "artist.html") await reloadScript("artists.js");
      if (movement) await movement;
      else await reloadScript("sphere-animation.js");
      const heading = document.querySelector("h1");
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
    } catch (error) {
      window.dispatchEvent(new Event("sendreturn:before-page-swap"));
      location.assign(url);
    } finally {
      switching = false;
    }
  }

  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      motion.matches
    )
      return;
    const link = event.target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download"))
      return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.hash || url.search) return;
    const current = pageName(location.href),
      target = pageName(url);
    if (
      !pages[current] ||
      !pages[target] ||
      current === target ||
      target === "index.html"
    )
      return;
    // A scene can remain unfinished while its sphere is still on screen or
    // rendering is paused. Never swallow a second navigation in that state:
    // let the browser follow the ordinary HTML link instead.
    if (switching) return;
    event.preventDefault();
    navigate(url.href);
  });

  window.addEventListener("popstate", () => {
    if (!pages[pageName(location.href)] || switching) {
      location.reload();
      return;
    }
    navigate(location.href, false);
  });
})();
