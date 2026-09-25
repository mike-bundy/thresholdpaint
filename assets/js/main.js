/* Threshold Painting & Maintenance — site scripts (no dependencies) */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Nav: scrolled state + mobile drawer */
  const nav = $(".nav");
  const onScroll = () => {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 24);
    const bar = $(".progress");
    if (bar) {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    }
    const mc = $(".mobile-cta");
    if (mc) mc.classList.toggle("is-visible", window.scrollY > 380);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = $(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$(".drawer a").forEach((a) => a.addEventListener("click", () => document.body.classList.remove("nav-open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.body.classList.remove("nav-open"); });
  }

  /* Cursor glow + card spotlight */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    let raf = 0, mx = 0, my = 0;
    window.addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--mx", mx + "px");
        document.documentElement.style.setProperty("--my", my + "px");
        raf = 0;
      });
    }, { passive: true });
    $$(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--cx", (e.clientX - r.left) + "px");
        card.style.setProperty("--cy", (e.clientY - r.top) + "px");
      });
    });
    /* 3D tilt on hero card */
    $$("[data-tilt]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(0)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* Scroll reveal */
  const revealEls = $$(".reveal, .reveal-l, .reveal-scale");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
    /* Belt-and-braces: reveal anything in view on scroll in case the observer is throttled */
    let rraf = 0;
    const sweep = () => {
      rraf = 0;
      const h = window.innerHeight;
      revealEls.forEach((el) => {
        if (!el.classList.contains("is-in") && el.getBoundingClientRect().top < h * 0.96) el.classList.add("is-in");
      });
    };
    window.addEventListener("scroll", () => { if (!rraf) rraf = setTimeout(sweep, 80); }, { passive: true });
    setTimeout(sweep, 1200);
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* Counters */
  const counters = $$("[data-count]");
  if (counters.length) {
    const run = (el) => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const dur = 1600, t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      if (reduce) { el.textContent = end + suffix; return; }
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  }

  /* Before / after sliders */
  $$(".ba").forEach((ba) => {
    const range = $("input[type=range]", ba);
    if (!range) return;
    const set = (v) => ba.style.setProperty("--pos", v + "%");
    set(range.value);
    range.addEventListener("input", () => set(range.value));
    /* gentle intro nudge */
    if (!reduce) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          io.unobserve(ba);
          let start = null;
          const anim = (t) => {
            if (!start) start = t;
            const p = Math.min(1, (t - start) / 1400);
            const v = 50 + Math.sin(p * Math.PI) * 18;
            set(v); range.value = v;
            if (p < 1) requestAnimationFrame(anim);
          };
          requestAnimationFrame(anim);
        });
      }, { threshold: 0.6 });
      io.observe(ba);
    }
  });

  /* Gallery filters + lightbox */
  const masonry = $(".masonry");
  if (masonry) {
    const figs = $$("figure", masonry);
    $$(".filters button").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".filters button").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const f = btn.dataset.filter;
        figs.forEach((fig) => fig.classList.toggle("is-hidden", f !== "all" && fig.dataset.cat !== f));
      });
    });
    const lb = $(".lightbox");
    if (lb) {
      const img = $("img", lb), cap = $(".lb-cap", lb);
      let idx = 0;
      const visible = () => figs.filter((f) => !f.classList.contains("is-hidden"));
      const show = (i) => {
        const list = visible();
        if (!list.length) return;
        idx = (i + list.length) % list.length;
        const f = list[idx];
        img.src = f.dataset.full || $("img", f).src;
        img.alt = $("img", f).alt;
        cap.textContent = $("figcaption", f) ? $("figcaption", f).textContent : "";
      };
      const open = (i) => { show(i); lb.classList.add("is-open"); document.body.style.overflow = "hidden"; };
      const close = () => { lb.classList.remove("is-open"); document.body.style.overflow = ""; };
      figs.forEach((f) => f.addEventListener("click", () => open(visible().indexOf(f))));
      $(".lb-close", lb).addEventListener("click", close);
      $(".lb-prev", lb).addEventListener("click", () => show(idx - 1));
      $(".lb-next", lb).addEventListener("click", () => show(idx + 1));
      lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
      document.addEventListener("keydown", (e) => {
        if (!lb.classList.contains("is-open")) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") show(idx - 1);
        if (e.key === "ArrowRight") show(idx + 1);
      });
      let tx = 0;
      lb.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - tx;
        if (Math.abs(dx) > 50) show(dx < 0 ? idx + 1 : idx - 1);
      });
    }
  }

  /* Contact form: AJAX submit to FormSubmit with graceful fallback */
  const form = $("form[data-ajax]");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = $("button[type=submit]", form);
      const note = $(".form-note", form);
      const orig = btn.textContent;
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("bad status");
        form.reset();
        note.style.display = "block";
        note.textContent = "Thanks! Your message is on its way. Garrett will get back to you within one business day.";
      } catch (err) {
        /* Fallback: open the user's mail client with the message prefilled */
        const fd = new FormData(form);
        const body = ["Name: " + fd.get("name"), "Phone: " + fd.get("phone"), "Email: " + fd.get("email"),
          "Project: " + fd.get("project"), "Location: " + fd.get("location"), "", fd.get("message")].join("\n");
        window.location.href = "mailto:garrett@thresholdpaint.com?subject=" + encodeURIComponent("Estimate request from " + fd.get("name")) + "&body=" + encodeURIComponent(body);
      } finally {
        btn.disabled = false; btn.textContent = orig;
      }
    });
  }

  /* Current year */
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
