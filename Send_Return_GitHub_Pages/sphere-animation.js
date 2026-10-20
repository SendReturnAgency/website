/* Send Return sphere animation
 * One scene per page. Intro: two spheres; agency pages: one sphere.
 * Renderer internals live in vendor/sphere-engine.js.
 */
(() => {
  const SETTINGS = {
    pixelRatio: 1.5,
    motionSpeed: 1,
    desktopFramesPerSecond: 60,
    mobileFramesPerSecond: 45,
    fadeMilliseconds: 180,
  };

  const loadScript = (source) =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = source;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Unable to load ${source}`));
      document.head.append(script);
    });

  window.SendReturnTextureURL = (source) =>
    window.SendReturnOfflineTextures?.[source] || source;

  async function initializeHero(hero) {
    if (hero.isConnected === false) return;
    const canvas = document.createElement("canvas");
    canvas.className = "hero-canvas";
    canvas.setAttribute("aria-hidden", "true");
    hero.prepend(canvas);

    const engine = window.SendReturnSphereEngine;
    let isIntro = hero.classList.contains("intro-hero");
    let isArtist = hero.classList.contains("artist-hero");
    let activeSide = isArtist ? "right" : "left";
    let transition = null;
    const background = isArtist
      ? "assets/artist-background.jpg"
      : "assets/background-grain.svg";
    let state;
    let frame = 0;
    let visible = true;
    let ready = false;
    let disposed = false;
    let previousTime = 0;
    let elapsed = 0;
    let lastDraw = 0;
    let resizeFrame = 0;

    function abortWhileLoading() {
      if (ready || disposed) return;
      disposed = true;
      if (state) engine.destroy(state);
      canvas.remove();
    }
    window.addEventListener("sendreturn:before-page-swap", abortWhileLoading, {
      once: true,
    });

    function resize() {
      if (!state || disposed) return;
      // Parallel projection keeps every sphere circular, including near the edges.
      if (state.camera.isOrthographicCamera) {
        const halfHeight = 2.071067812;
        const aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
        state.camera.left = -halfHeight * aspect;
        state.camera.right = halfHeight * aspect;
        state.camera.top = halfHeight;
        state.camera.bottom = -halfHeight;
        state.camera.updateProjectionMatrix();
      }
      const positions = ready
        ? [state.left, state.right].map((sphere) => ({
            x: sphere.mesh.position.x,
            y: sphere.mesh.position.y,
            z: sphere.mesh.position.z,
            rx: sphere.mesh.rotation.x,
            ry: sphere.mesh.rotation.y,
            rz: sphere.mesh.rotation.z,
            vx: sphere.vx,
            vy: sphere.vy,
          }))
        : null;
      engine.resize(state);
      if (positions)
        [state.left, state.right].forEach((sphere, index) => {
          const position = positions[index];
          sphere.mesh.position.set(position.x, position.y, position.z);
          sphere.mesh.rotation.set(position.rx, position.ry, position.rz);
          sphere.vx = position.vx;
          sphere.vy = position.vy;
        });
      // The source renderer also supports expanding either half of the intro.
      // Here both background panels are placed immediately, without an opening morph.
      for (const background of ready ? [] : [state.bgLeft, state.bgRight]) {
        background.mesh.scale.copy(background.targetScale);
        background.mesh.position.copy(background.targetPos);
      }
      draw();
    }

    function draw() {
      if (!ready || disposed) return;
      // Original Vercel frame: frozen background texture on the departing sphere,
      // freely moving sphere positions, and exponential expansion of the panels.
      engine.step(state);
      if (!transition) return;
      const previous = state[transition.from];
      const world = engine.worldSize(
        state.camera,
        Math.abs(state.camera.position.z),
      );
      const outside =
        Math.abs(previous.mesh.position.x) - previous.radius > world.w / 2 ||
        Math.abs(previous.mesh.position.y) - previous.radius > world.h / 2;
      // End when the original background interpolation has settled, not after a guessed duration.
      const settled = [state.bgLeft, state.bgRight].every(
        (panel) =>
          panel.mesh.scale.distanceTo(panel.targetScale) < 0.01 &&
          panel.mesh.position.distanceTo(panel.targetPos) < 0.01,
      );
      if (outside && settled) {
        const finished = transition;
        state.scene.remove(previous.mesh);
        activeSide = finished.to;
        isArtist = activeSide === "right";
        transition = null;
        finished.resolve();
      }
    }

    function tick(time) {
      if (disposed || !visible || document.hidden) {
        frame = 0;
        return;
      }
      draw();
      frame = requestAnimationFrame(tick);
    }

    function synchronizePlayback() {
      if (!ready || disposed) return;
      if (!visible || document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (!frame) {
        previousTime = 0;
        frame = requestAnimationFrame(tick);
      }
    }

    try {
      state = engine.create(canvas, {
        backgroundSrcLeft: window.SendReturnTextureURL(
          "assets/background-grain.svg",
        ),
        backgroundSrcRight: window.SendReturnTextureURL(
          "assets/artist-background.jpg",
        ),
        expandedSide: { value: isIntro ? null : activeSide },
        singleSphere: !isIntro,
      });

      if (!isIntro && activeSide === "right") {
        state.scene.remove(state.left.mesh);
        state.scene.add(state.right.mesh);
      }
      state.guiState.speedFactor = 0.002 * SETTINGS.motionSpeed;
      state.startTime = performance.now() - 4000;
      state.lastFrameTime = performance.now() - state.frameInterval;
      // No 0.8-second pause or three-second material build-up.
      state.updateMaterial();
      for (const sphere of [state.left, state.right]) {
        sphere.mat.opacity = 1;
        sphere.mat.color.setHex(state.guiState.colorLeft);
      }
      state.effectiveDpr = Math.min(
        window.devicePixelRatio || 1,
        SETTINGS.pixelRatio,
      );
      state.dprCap = SETTINGS.pixelRatio;
      resize();
      await state.ready;
      if (disposed) return;
      window.removeEventListener(
        "sendreturn:before-page-swap",
        abortWhileLoading,
      );

      ready = true;
      // Prepare and draw the completed scene before replacing the immediate image fallback.
      resize();
      draw();
      hero.style.setProperty(
        "--sphere-fade-duration",
        `${SETTINGS.fadeMilliseconds}ms`,
      );
      hero.classList.add("animation-ready");
      canvas.style.opacity = "1";
      hero.transferAgencyScene = (nextHero, target) => {
        const nextSide = target === "artist.html" ? "right" : "left";
        // On the intro, the unselected sphere departs; the selected one stays live.
        const departingSide = isIntro
          ? nextSide === "left"
            ? "right"
            : "left"
          : activeSide;
        isIntro = false;
        delete hero.transferAgencyScene;
        visibilityObserver.unobserve(hero);
        hero = nextHero;
        hero.prepend(canvas);
        hero.classList.add("animation-ready");
        hero.transferAgencyScene = transfer;
        visibilityObserver.observe(hero);
        visible = true;
        state.props.expandedSide.value = nextSide;
        state.scene.add(state[nextSide].mesh);
        const completion = new Promise((resolve) => {
          transition = {
            from: departingSide,
            to: nextSide,
            resolve,
          };
        });
        resize();
        synchronizePlayback();
        return completion;
      };
      const transfer = hero.transferAgencyScene;

      state.ro.disconnect();
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(resize);
      });
      resizeObserver.observe(canvas);
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        synchronizePlayback();
      });
      visibilityObserver.observe(hero);
      document.addEventListener("visibilitychange", synchronizePlayback);
      synchronizePlayback();

      function cleanup() {
        if (disposed) return;
        disposed = true;
        cancelAnimationFrame(frame);
        cancelAnimationFrame(resizeFrame);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        document.removeEventListener("visibilitychange", synchronizePlayback);
        window.removeEventListener("sendreturn:before-page-swap", cleanup);
        delete hero.transferAgencyScene;
        engine.destroy(state);
      }
      window.addEventListener("sendreturn:before-page-swap", cleanup, {
        once: true,
      });
      document.dispatchEvent?.(new Event("sendreturn:scene-ready"));
      canvas.addEventListener("webglcontextlost", () => {
        hero.classList.remove("animation-ready");
        canvas.style.opacity = "0";
        cleanup();
      });
      window.addEventListener(
        "pagehide",
        (event) => {
          if (!event.persisted) cleanup();
        },
        { once: true },
      );
    } catch (error) {
      window.removeEventListener(
        "sendreturn:before-page-swap",
        abortWhileLoading,
      );
      hero.classList.remove("animation-ready");
      canvas.remove();
      if (state) engine.destroy(state);
      console.warn("Using the static sphere fallback.", error);
    }
  }

  async function start() {
    const heroes = [...document.querySelectorAll(".hero:not(.case-hero)")];
    if (
      !heroes.length ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    try {
      if (location.protocol === "file:" && !window.SendReturnOfflineTextures)
        await loadScript("vendor/offline-textures.js");
      if (!window.SendReturnSphereEngine)
        await loadScript("vendor/sphere-engine.js");
      await Promise.all(heroes.map(initializeHero));
    } catch (error) {
      console.warn(
        "Animation resources unavailable; keeping the visible fallback.",
        error,
      );
    }
  }
  start();
})();
