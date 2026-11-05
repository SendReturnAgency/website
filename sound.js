/* Optional site soundtrack. No media request until the listener opts in. */
(() => {
  if (window.SendReturnSound) { window.SendReturnSound.mount(); return; }
  const audio = new Audio();
  audio.preload = "none";
  audio.volume = 0.35;
  const source = "assets/shiffer-surrender-convolute-remix.mp3";
  const key = "sendreturn.sound.v1";
  let button, loading = false;
  function read() { try { return JSON.parse(sessionStorage.getItem(key)) || {}; } catch { return {}; } }
  function save(enabled = !audio.paused) {
    try { sessionStorage.setItem(key, JSON.stringify({ enabled, time: audio.currentTime || 0 })); } catch {}
  }
  function labels() {
    const de = document.documentElement.lang.startsWith("de");
    return de ? {on:"Ton an",off:"Ton aus",start:"Musik einschalten",stop:"Musik ausschalten",loading:"Musik wird geladen",error:"Musik konnte nicht gestartet werden. Bitte erneut tippen."}
      : {on:"Sound on",off:"Sound off",start:"Turn music on",stop:"Turn music off",loading:"Loading music",error:"Music could not start. Please tap again."};
  }
  function update() {
    if (!button) return;
    const text = labels(), on = !audio.paused && !audio.ended;
    button.setAttribute("aria-pressed", String(on));
    button.setAttribute("aria-label", loading ? text.loading : on ? text.stop : text.start);
    button.setAttribute("aria-busy", String(loading));
    button.title = "Shiffer — Surrender (Convolute Remix)";
    button.querySelector(".sound-label").textContent = on ? text.on : text.off;
    button.querySelector(".sound-off-mark").style.display = on ? "none" : "";
    button.querySelector(".sound-waves").style.display = on ? "" : "none";
  }
  async function play(time) {
    if (loading) return;
    loading = true; update();
    if (!audio.getAttribute("src")) {
      audio.src = source;
      if (Number.isFinite(time) && time > 0) {
        audio.addEventListener("loadedmetadata", () => {
          if (Number.isFinite(audio.duration) && time < audio.duration) audio.currentTime = time;
        }, {once:true});
      }
    }
    try { await audio.play(); save(true); }
    catch { audio.pause(); save(false); if (button) button.title = labels().error; }
    finally { loading = false; update(); }
  }
  function mount() {
    document.querySelectorAll(".site-sound").forEach(node => node.remove());
    button = document.createElement("button");
    button.type = "button";
    button.className = "site-sound";
    button.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true" focusable="false"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path class="sound-off-mark" d="m16 9 6 6m0-6-6 6"/><path class="sound-waves" d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg><span class="sound-label"></span>';
    button.addEventListener("click", () => {
      if (loading) { audio.pause(); loading = false; save(false); update(); return; }
      if (audio.paused || audio.ended) play();
      else { audio.pause(); save(false); }
    });
    document.body.append(button); update();
  }
  for (const event of ["play","pause","ended","error"]) audio.addEventListener(event, () => {
    if (event === "ended") save(false);
    if (event === "error") { loading = false; save(false); }
    update();
  });
  window.addEventListener("pagehide", () => save());
  window.SendReturnSound = { mount };
  mount();
  // Only resume in the same tab after a previous explicit opt-in. Safari may
  // reject this after a full navigation; remain silent and let the user tap.
  const saved = read();
  if (saved.enabled) play(saved.time);
})();
