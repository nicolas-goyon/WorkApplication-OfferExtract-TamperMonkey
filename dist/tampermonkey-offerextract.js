"use strict";
var TMOfferExtract = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Generic: () => generic_exports,
    init: () => init
  });

  // src/sites/generic/index.ts
  var generic_exports = {};
  __export(generic_exports, {
    extract: () => extract
  });

  // src/shared/text.ts
  function textOf(value) {
    const trimmed = value?.replace(/\s+/g, " ").trim();
    return trimmed ? trimmed : void 0;
  }

  // src/sites/generic/extract.ts
  function extractGenericOffer() {
    const jobPosting = findJobPostingJsonLd();
    return {
      url: location.href,
      title: textOf(jobPosting?.title) ?? textOf(document.title),
      company: textOf(jobPosting?.hiringOrganization?.name),
      location: textOf(jobPosting?.jobLocation?.address?.addressLocality),
      description: textOf(jobPosting?.description) ?? textOf(getMetaContent("description")),
      raw: jobPosting
    };
  }
  function findJobPostingJsonLd() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of Array.from(scripts)) {
      const parsed = tryParseJson(script.textContent);
      if (!parsed) continue;
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const jobPosting = items.find((item) => item && item["@type"] === "JobPosting");
      if (jobPosting) return jobPosting;
    }
    return void 0;
  }
  function tryParseJson(text) {
    if (!text) return void 0;
    try {
      return JSON.parse(text);
    } catch {
      return void 0;
    }
  }
  function getMetaContent(name) {
    return document.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ?? null;
  }

  // src/sites/generic/index.ts
  var extract = extractGenericOffer;

  // src/core/menuCommand.ts
  function registerMenuCommand(label, onCommand) {
    if (typeof GM_registerMenuCommand === "function") {
      GM_registerMenuCommand(label, onCommand);
    }
  }

  // src/core/defaultJobSites.ts
  var DEFAULT_JOB_SITE_HOSTNAMES = [
    // Global job boards
    "linkedin.com",
    "indeed.com",
    "glassdoor.com",
    "monster.com",
    "ziprecruiter.com",
    "careerbuilder.com",
    "simplyhired.com",
    "dice.com",
    "wellfound.com",
    "remote.co",
    "weworkremotely.com",
    "flexjobs.com",
    "remoteok.com",
    "himalayas.app",
    "otta.com",
    "hiringcafe.com",
    "workatastartup.com",
    // Regional job boards
    "seek.com.au",
    "jobstreet.com",
    "reed.co.uk",
    "totaljobs.com",
    "cv-library.co.uk",
    "stepstone.com",
    "xing.com",
    "welcometothejungle.com",
    "jobteaser.com",
    "apec.fr",
    "francetravail.fr",
    "hellowork.com",
    "cadremploi.fr",
    "keljob.com",
    // ATS / careers platforms
    "greenhouse.io",
    "lever.co",
    "smartrecruiters.com",
    "jobvite.com",
    "icims.com",
    "workable.com",
    "breezy.hr",
    "recruitee.com",
    "teamtailor.com",
    "jazzhr.com",
    "bamboohr.com",
    "ashbyhq.com",
    "personio.de",
    "personio.com",
    "myworkdayjobs.com"
  ];

  // src/core/storage.ts
  function hasGMStorage() {
    return typeof GM_getValue === "function" && typeof GM_setValue === "function";
  }
  function getValue(key, defaultValue) {
    if (hasGMStorage()) return GM_getValue(key, defaultValue);
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  }
  function setValue(key, value) {
    if (hasGMStorage()) {
      GM_setValue(key, value);
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
    }
  }
  function onValueChange(key, listener) {
    if (typeof GM_addValueChangeListener === "function") {
      GM_addValueChangeListener(
        key,
        (_name, oldValue, newValue, remote) => listener(newValue, oldValue, remote)
      );
    }
  }

  // src/core/siteStatus.ts
  var SITE_STATUS_KEY = "offerextract:siteJobStatus";
  var listeners = /* @__PURE__ */ new Set();
  function readMap() {
    return getValue(SITE_STATUS_KEY, {});
  }
  function notify(hostname, isJobSite) {
    for (const listener of listeners) listener(hostname, isJobSite);
  }
  function getSiteStatus(hostname) {
    return readMap()[hostname];
  }
  function hasAskedForSite(hostname) {
    return getSiteStatus(hostname) !== void 0;
  }
  function setSiteStatus(hostname, isJobSite) {
    const map = readMap();
    map[hostname] = isJobSite;
    setValue(SITE_STATUS_KEY, map);
    notify(hostname, isJobSite);
  }
  function clearSiteStatus(hostname) {
    const map = readMap();
    delete map[hostname];
    setValue(SITE_STATUS_KEY, map);
    notify(hostname, void 0);
  }
  function onSiteStatusChange(listener) {
    listeners.add(listener);
  }
  function getAllSiteStatuses() {
    return Object.entries(readMap()).map(([hostname, isJobSite]) => ({ hostname, isJobSite })).sort((a, b) => a.hostname.localeCompare(b.hostname));
  }
  function renameSiteHostname(oldHostname, newHostname) {
    const trimmed = newHostname.trim();
    if (!trimmed || trimmed === oldHostname) return;
    const map = readMap();
    if (!(oldHostname in map)) return;
    const isJobSite = map[oldHostname];
    delete map[oldHostname];
    map[trimmed] = isJobSite;
    setValue(SITE_STATUS_KEY, map);
    notify(oldHostname, void 0);
    notify(trimmed, isJobSite);
  }

  // src/core/seedDefaultSites.ts
  var SEEDED_KEY = "offerextract:hasSeededDefaultSites";
  function seedDefaultJobSitesOnce(loadDefaultSites) {
    if (!loadDefaultSites) return;
    const alreadySeeded = getValue(SEEDED_KEY, false);
    if (alreadySeeded) return;
    for (const hostname of DEFAULT_JOB_SITE_HOSTNAMES) {
      if (getSiteStatus(hostname) === void 0) {
        setSiteStatus(hostname, true);
      }
    }
    setValue(SEEDED_KEY, true);
  }

  // src/core/buttonPosition.ts
  var BUTTON_CORNER_KEY = "offerextract:buttonCorner";
  var DEFAULT_CORNER = "bottom-right";
  function getButtonCorner() {
    return getValue(BUTTON_CORNER_KEY, DEFAULT_CORNER);
  }
  function setButtonCorner(corner) {
    setValue(BUTTON_CORNER_KEY, corner);
  }

  // src/ui/cornerStyles.ts
  function cornerStyles(corner, margin) {
    const base = { left: "auto", right: "auto", top: "auto", bottom: "auto" };
    switch (corner) {
      case "top-left":
        return { ...base, top: `${margin}px`, left: `${margin}px` };
      case "top-right":
        return { ...base, top: `${margin}px`, right: `${margin}px` };
      case "bottom-left":
        return { ...base, bottom: `${margin}px`, left: `${margin}px` };
      case "bottom-right":
      default:
        return { ...base, bottom: `${margin}px`, right: `${margin}px` };
    }
  }

  // src/ui/floatingButton.ts
  var SIZE = 48;
  var MARGIN = 20;
  var DRAG_THRESHOLD = 6;
  function installFloatingButton({ id, label, onClick }) {
    if (document.getElementById(id)) return;
    const button = document.createElement("button");
    button.id = id;
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-label", "Open Offer Extract menu");
    Object.assign(button.style, {
      position: "fixed",
      zIndex: "2147483647",
      width: `${SIZE}px`,
      height: `${SIZE}px`,
      borderRadius: "50%",
      border: "none",
      background: "#2563eb",
      color: "#fff",
      font: "20px/1 system-ui, sans-serif",
      cursor: "grab",
      boxShadow: "0 2px 10px rgba(0,0,0,.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      touchAction: "none",
      userSelect: "none"
    });
    Object.assign(button.style, cornerStyles(getButtonCorner(), MARGIN));
    document.body.appendChild(button);
    button.addEventListener("pointerdown", (downEvent) => {
      let dragging = false;
      let lastX = downEvent.clientX;
      let lastY = downEvent.clientY;
      button.setPointerCapture(downEvent.pointerId);
      const onMove = (moveEvent) => {
        const dx = moveEvent.clientX - lastX;
        const dy = moveEvent.clientY - lastY;
        const totalDx = moveEvent.clientX - downEvent.clientX;
        const totalDy = moveEvent.clientY - downEvent.clientY;
        if (!dragging && Math.hypot(totalDx, totalDy) > DRAG_THRESHOLD) {
          dragging = true;
          button.style.cursor = "grabbing";
        }
        if (dragging) {
          const rect = button.getBoundingClientRect();
          Object.assign(button.style, {
            left: `${rect.left + dx}px`,
            top: `${rect.top + dy}px`,
            right: "auto",
            bottom: "auto"
          });
        }
        lastX = moveEvent.clientX;
        lastY = moveEvent.clientY;
      };
      const onUp = (upEvent) => {
        button.releasePointerCapture(upEvent.pointerId);
        button.removeEventListener("pointermove", onMove);
        button.removeEventListener("pointerup", onUp);
        button.style.cursor = "grab";
        if (dragging) {
          const corner = nearestCorner(button.getBoundingClientRect());
          setButtonCorner(corner);
          Object.assign(button.style, cornerStyles(corner, MARGIN));
        } else {
          onClick();
        }
      };
      button.addEventListener("pointermove", onMove);
      button.addEventListener("pointerup", onUp);
    });
    onValueChange(BUTTON_CORNER_KEY, (corner) => {
      Object.assign(button.style, cornerStyles(corner, MARGIN));
    });
  }
  function removeFloatingButton(id) {
    document.getElementById(id)?.remove();
  }
  function nearestCorner(rect) {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const isLeft = centerX < window.innerWidth / 2;
    const isTop = centerY < window.innerHeight / 2;
    if (isTop) return isLeft ? "top-left" : "top-right";
    return isLeft ? "bottom-left" : "bottom-right";
  }

  // src/ui/menuPanel.ts
  var PANEL_ID = "offerextract-menu-panel";
  var PANEL_MARGIN = 84;
  var panelEl = null;
  var contentEl = null;
  var tabs = [];
  var activeTab = null;
  var tabButtons = /* @__PURE__ */ new Map();
  function registerMenuTabs(newTabs) {
    tabs = newTabs;
    activeTab = newTabs[0]?.id ?? null;
  }
  function openMenu() {
    if (!panelEl) buildPanel();
    Object.assign(panelEl.style, cornerStyles(getButtonCorner(), PANEL_MARGIN));
    panelEl.style.display = "flex";
    renderActiveTab();
  }
  function closeMenu() {
    if (!panelEl) return;
    deactivateCurrentTab();
    panelEl.style.display = "none";
  }
  function toggleMenu() {
    const isOpen = !!panelEl && panelEl.style.display !== "none";
    if (isOpen) closeMenu();
    else openMenu();
  }
  function buildPanel() {
    document.getElementById(PANEL_ID)?.remove();
    tabButtons.clear();
    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    Object.assign(panel.style, {
      position: "fixed",
      zIndex: "2147483647",
      width: "440px",
      maxHeight: "78vh",
      background: "#111827",
      color: "#f9fafb",
      borderRadius: "12px",
      boxShadow: "0 8px 30px rgba(0,0,0,.4)",
      display: "none",
      flexDirection: "column",
      overflow: "hidden",
      font: "13px/1.4 system-ui, sans-serif"
    });
    const nav = document.createElement("div");
    Object.assign(nav.style, {
      display: "flex",
      alignItems: "center",
      borderBottom: "1px solid rgba(255,255,255,.1)",
      background: "#1f2937",
      flex: "0 0 auto"
    });
    for (const tab of tabs) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = tab.label;
      Object.assign(button.style, {
        flex: "1",
        padding: "10px 8px",
        border: "none",
        borderBottom: "2px solid transparent",
        background: "transparent",
        color: "#f9fafb",
        cursor: "pointer",
        font: "inherit"
      });
      button.addEventListener("click", () => {
        if (activeTab === tab.id) return;
        deactivateCurrentTab();
        activeTab = tab.id;
        renderActiveTab();
      });
      tabButtons.set(tab.id, button);
      nav.appendChild(button);
    }
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "\u2715";
    closeButton.setAttribute("aria-label", "Close menu");
    Object.assign(closeButton.style, {
      border: "none",
      background: "transparent",
      color: "#9ca3af",
      cursor: "pointer",
      padding: "10px 12px",
      font: "inherit"
    });
    closeButton.addEventListener("click", closeMenu);
    nav.appendChild(closeButton);
    const content = document.createElement("div");
    Object.assign(content.style, {
      padding: "14px",
      overflowY: "auto"
    });
    panel.appendChild(nav);
    panel.appendChild(content);
    document.body.appendChild(panel);
    panelEl = panel;
    contentEl = content;
  }
  function deactivateCurrentTab() {
    tabs.find((tab) => tab.id === activeTab)?.onDeactivate?.();
  }
  function renderActiveTab() {
    if (!contentEl) return;
    for (const tab of tabs) {
      const button = tabButtons.get(tab.id);
      if (!button) continue;
      const isActive = tab.id === activeTab;
      button.style.borderBottomColor = isActive ? "#2563eb" : "transparent";
      button.style.opacity = isActive ? "1" : ".7";
    }
    contentEl.innerHTML = "";
    const active = tabs.find((tab) => tab.id === activeTab);
    active?.render(contentEl);
  }

  // src/ui/sitePrompt.ts
  var PROMPT_ID = "offerextract-site-prompt";
  var PROMPT_MARGIN = 84;
  function showSitePrompt(onAnswered) {
    if (document.getElementById(PROMPT_ID)) return;
    const box2 = document.createElement("div");
    box2.id = PROMPT_ID;
    Object.assign(box2.style, {
      position: "fixed",
      zIndex: "2147483647",
      width: "260px",
      background: "#111827",
      color: "#f9fafb",
      borderRadius: "12px",
      boxShadow: "0 8px 30px rgba(0,0,0,.4)",
      padding: "16px",
      font: "13px/1.4 system-ui, sans-serif"
    });
    Object.assign(box2.style, cornerStyles(getButtonCorner(), PROMPT_MARGIN));
    const question = document.createElement("p");
    question.textContent = "Is this a job-related website (job board, ATS, application form)?";
    Object.assign(question.style, { margin: "0 0 12px" });
    box2.appendChild(question);
    const row = document.createElement("div");
    Object.assign(row.style, { display: "flex", gap: "8px" });
    const answer = (isJobSite) => {
      setSiteStatus(location.hostname, isJobSite);
      box2.remove();
      onAnswered?.(isJobSite);
    };
    const yesButton = document.createElement("button");
    yesButton.type = "button";
    yesButton.textContent = "Yes";
    styleAnswerButton(yesButton, "#2563eb");
    yesButton.addEventListener("click", () => answer(true));
    const noButton = document.createElement("button");
    noButton.type = "button";
    noButton.textContent = "No";
    styleAnswerButton(noButton, "#374151");
    noButton.addEventListener("click", () => answer(false));
    row.appendChild(yesButton);
    row.appendChild(noButton);
    box2.appendChild(row);
    document.body.appendChild(box2);
  }
  function styleAnswerButton(button, background) {
    Object.assign(button.style, {
      flex: "1",
      padding: "8px",
      borderRadius: "6px",
      border: "none",
      background,
      color: "#fff",
      cursor: "pointer",
      font: "inherit"
    });
  }

  // src/shared/ui/notify.ts
  function notify2(message, options = {}) {
    const { durationMs = 4e3 } = options;
    const toast = document.createElement("div");
    toast.textContent = message;
    Object.assign(toast.style, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
      zIndex: "2147483647",
      background: "#1f2937",
      color: "#f9fafb",
      padding: "10px 14px",
      borderRadius: "8px",
      font: "13px/1.4 system-ui, sans-serif",
      boxShadow: "0 2px 8px rgba(0,0,0,.25)",
      maxWidth: "320px"
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), durationMs);
  }

  // src/shared/ui/elementOverlay.ts
  function createOverlayBox(color, zIndex = 2147483646) {
    const box2 = document.createElement("div");
    Object.assign(box2.style, {
      position: "fixed",
      zIndex: String(zIndex),
      pointerEvents: "none",
      border: `2px solid ${color}`,
      background: `${color}26`,
      boxSizing: "border-box",
      display: "none"
    });
    return box2;
  }
  function positionOverlayOnElement(box2, el) {
    const rect = el.getBoundingClientRect();
    Object.assign(box2.style, {
      display: "block",
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });
  }
  function hideOverlayBox(box2) {
    box2.style.display = "none";
  }

  // src/ui/elementInspector.ts
  var OVERLAY_ID = "offerextract-inspect-overlay";
  var BANNER_ID = "offerextract-inspect-banner";
  var OWN_UI_SELECTOR = `#${OVERLAY_ID}, #${BANNER_ID}, #offerextract-menu-panel, #offerextract-button`;
  function startInspecting(onSelect, onCancel) {
    const overlay = createOverlayBox("#2563eb");
    overlay.id = OVERLAY_ID;
    const banner = createBanner();
    document.body.appendChild(overlay);
    document.body.appendChild(banner);
    const previousCursor = document.documentElement.style.cursor;
    document.documentElement.style.cursor = "crosshair";
    let stopped = false;
    const targetAt = (event) => {
      const el = document.elementFromPoint(event.clientX, event.clientY);
      return el && !el.closest(OWN_UI_SELECTOR) ? el : null;
    };
    const onMouseMove = (event) => {
      const target = targetAt(event);
      if (target) positionOverlayOnElement(overlay, target);
      else hideOverlayBox(overlay);
    };
    const onClick = (event) => {
      const target = targetAt(event);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      stop();
      onSelect(target);
    };
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      stop();
      onCancel();
    };
    function stop() {
      if (stopped) return;
      stopped = true;
      document.removeEventListener("mousemove", onMouseMove, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeyDown, true);
      document.documentElement.style.cursor = previousCursor;
      overlay.remove();
      banner.remove();
    }
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);
    return {
      cancel: () => {
        if (stopped) return;
        stop();
        onCancel();
      }
    };
  }
  function createBanner() {
    const banner = document.createElement("div");
    banner.id = BANNER_ID;
    banner.textContent = "Click an element to select it \u2014 Esc to cancel";
    Object.assign(banner.style, {
      position: "fixed",
      top: "16px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "2147483647",
      background: "#111827",
      color: "#f9fafb",
      padding: "8px 16px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,.35)",
      font: "13px/1.4 system-ui, sans-serif",
      pointerEvents: "none"
    });
    return banner;
  }

  // src/ui/elementSelectionHighlight.ts
  var box = null;
  var rafId = null;
  var currentEl = null;
  function showSelectionHighlight(el) {
    currentEl = el;
    if (!box) {
      box = createOverlayBox("#22c55e");
      document.body.appendChild(box);
    }
    positionOverlayOnElement(box, el);
    if (rafId === null) tick();
  }
  function hideSelectionHighlight() {
    currentEl = null;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    box?.remove();
    box = null;
  }
  function tick() {
    if (currentEl && box) positionOverlayOnElement(box, currentEl);
    rafId = requestAnimationFrame(tick);
  }

  // src/ui/tabs/jobExtractionTab.ts
  var MAX_ANCESTOR_LEVELS = 12;
  var PREVIEW_MAX_CHARS = 4e3;
  var ancestorChain = [];
  var level = 0;
  function currentSelected() {
    return ancestorChain[level] ?? null;
  }
  var jobExtractionTab = {
    id: "job-extraction",
    label: "Job extraction",
    render(container) {
      const hostname = location.hostname;
      const statusLine = document.createElement("p");
      Object.assign(statusLine.style, { margin: "0 0 10px" });
      const toggleRow = document.createElement("div");
      Object.assign(toggleRow.style, {
        display: "flex",
        gap: "8px",
        marginBottom: "14px"
      });
      const yesButton = document.createElement("button");
      const noButton = document.createElement("button");
      yesButton.type = "button";
      noButton.type = "button";
      yesButton.textContent = "Job site";
      noButton.textContent = "Not a job site";
      styleChoiceButton(yesButton);
      styleChoiceButton(noButton);
      const divider = document.createElement("div");
      Object.assign(divider.style, {
        borderTop: "1px solid rgba(255,255,255,.1)",
        margin: "0 0 14px"
      });
      const section = document.createElement("div");
      const refresh = () => {
        const status = getSiteStatus(hostname);
        statusLine.textContent = describeStatus(hostname, status);
        setActive(yesButton, status === true);
        setActive(noButton, status === false);
        renderExtractionSection(section, status === true);
      };
      yesButton.addEventListener("click", () => {
        setSiteStatus(hostname, true);
        refresh();
      });
      noButton.addEventListener("click", () => {
        setSiteStatus(hostname, false);
        refresh();
      });
      toggleRow.appendChild(yesButton);
      toggleRow.appendChild(noButton);
      container.appendChild(statusLine);
      container.appendChild(toggleRow);
      container.appendChild(divider);
      container.appendChild(section);
      refresh();
    },
    onDeactivate() {
      hideSelectionHighlight();
    }
  };
  function renderExtractionSection(section, isJobSite) {
    section.innerHTML = "";
    if (!isJobSite) {
      hideSelectionHighlight();
      const message = document.createElement("p");
      message.textContent = "Mark this site as a job site to enable offer extraction.";
      Object.assign(message.style, { margin: "0", color: "#9ca3af" });
      section.appendChild(message);
      return;
    }
    const selected = currentSelected();
    const pickRow = document.createElement("div");
    Object.assign(pickRow.style, {
      display: "flex",
      gap: "8px",
      marginBottom: "12px"
    });
    const pickButton = document.createElement("button");
    pickButton.type = "button";
    pickButton.textContent = selected ? "Re-pick element" : "Fetch offer";
    styleActionButton(pickButton, true);
    pickButton.addEventListener("click", () => startPicking());
    pickRow.appendChild(pickButton);
    if (selected) {
      const clearButton = document.createElement("button");
      clearButton.type = "button";
      clearButton.textContent = "Clear";
      styleActionButton(clearButton, false);
      clearButton.addEventListener("click", () => {
        ancestorChain = [];
        level = 0;
        hideSelectionHighlight();
        renderExtractionSection(section, true);
      });
      pickRow.appendChild(clearButton);
    }
    section.appendChild(pickRow);
    if (!selected) {
      const hint = document.createElement("p");
      hint.textContent = 'Click "Fetch offer", then click any element on the page (e.g. a paragraph of the description). Press Esc to cancel.';
      Object.assign(hint.style, { margin: "0", color: "#9ca3af" });
      section.appendChild(hint);
      return;
    }
    showSelectionHighlight(selected);
    const label = document.createElement("p");
    Object.assign(label.style, {
      margin: "0 0 6px",
      fontFamily: "ui-monospace, SFMono-Regular, monospace",
      fontSize: "12px",
      color: "#93c5fd",
      overflowWrap: "anywhere"
    });
    const sliderRow = document.createElement("div");
    Object.assign(sliderRow.style, {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "12px"
    });
    const sliderCaption = document.createElement("span");
    sliderCaption.textContent = "Zoom out";
    Object.assign(sliderCaption.style, { color: "#9ca3af", flex: "0 0 auto" });
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = String(Math.max(ancestorChain.length - 1, 0));
    slider.value = String(level);
    slider.disabled = ancestorChain.length <= 1;
    Object.assign(slider.style, { flex: "1" });
    const sliderValue = document.createElement("span");
    Object.assign(sliderValue.style, { color: "#9ca3af", flex: "0 0 auto", minWidth: "48px", textAlign: "right" });
    const preview = document.createElement("pre");
    Object.assign(preview.style, {
      margin: "0 0 12px",
      padding: "10px",
      background: "#0b1220",
      border: "1px solid rgba(255,255,255,.1)",
      borderRadius: "8px",
      maxHeight: "220px",
      overflow: "auto",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      fontFamily: "ui-monospace, SFMono-Regular, monospace",
      fontSize: "11px",
      color: "#d1d5db"
    });
    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "Copy selected HTML";
    styleActionButton(copyButton, true);
    copyButton.addEventListener("click", () => {
      const el = currentSelected();
      if (!el) return;
      copyToClipboard(el.outerHTML);
    });
    const updateForCurrentLevel = () => {
      const el = currentSelected();
      if (!el) return;
      label.textContent = describeElement(el);
      sliderValue.textContent = `${level} / ${Math.max(ancestorChain.length - 1, 0)}`;
      preview.textContent = truncate(el.outerHTML);
      showSelectionHighlight(el);
    };
    slider.addEventListener("input", () => {
      level = Number(slider.value);
      updateForCurrentLevel();
    });
    sliderRow.appendChild(sliderCaption);
    sliderRow.appendChild(slider);
    sliderRow.appendChild(sliderValue);
    section.appendChild(label);
    section.appendChild(sliderRow);
    section.appendChild(preview);
    section.appendChild(copyButton);
    updateForCurrentLevel();
  }
  function startPicking() {
    hideSelectionHighlight();
    closeMenu();
    startInspecting(
      (el) => {
        ancestorChain = computeAncestorChain(el);
        level = 0;
        openMenu();
      },
      () => {
        openMenu();
      }
    );
  }
  function computeAncestorChain(el) {
    const chain = [el];
    let current = el;
    while (current.parentElement && chain.length < MAX_ANCESTOR_LEVELS) {
      current = current.parentElement;
      chain.push(current);
      if (current === document.body) break;
    }
    return chain;
  }
  function describeElement(el) {
    let out = `<${el.tagName.toLowerCase()}`;
    if (el.id) out += ` id="${el.id}"`;
    const cls = el.getAttribute("class")?.trim();
    if (cls) out += ` class="${cls.length > 80 ? `${cls.slice(0, 80)}\u2026` : cls}"`;
    return `${out}>`;
  }
  function truncate(text) {
    return text.length > PREVIEW_MAX_CHARS ? `${text.slice(0, PREVIEW_MAX_CHARS)}
\u2026 (truncated for preview \u2014 full HTML is copied)` : text;
  }
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      notify2("Copied selected HTML to clipboard.");
    } catch {
      notify2("Could not copy \u2014 clipboard access was blocked.");
    }
  }
  function describeStatus(hostname, status) {
    if (status === true) return `${hostname} is marked as a job site.`;
    if (status === false) return `${hostname} is marked as not a job site.`;
    return `${hostname} hasn't been classified yet.`;
  }
  function styleChoiceButton(button) {
    Object.assign(button.style, {
      flex: "1",
      padding: "8px",
      borderRadius: "6px",
      border: "1px solid rgba(255,255,255,.2)",
      background: "transparent",
      color: "#f9fafb",
      cursor: "pointer",
      font: "inherit"
    });
  }
  function styleActionButton(button, primary) {
    Object.assign(button.style, {
      padding: "8px 14px",
      borderRadius: "6px",
      border: primary ? "none" : "1px solid rgba(255,255,255,.2)",
      background: primary ? "#2563eb" : "transparent",
      color: "#f9fafb",
      cursor: "pointer",
      font: "inherit"
    });
  }
  function setActive(button, active) {
    button.style.borderColor = active ? "#2563eb" : "rgba(255,255,255,.2)";
    button.style.background = active ? "#2563eb" : "transparent";
  }

  // src/ui/tabs/settingsTab.ts
  var settingsTab = {
    id: "settings",
    label: "Settings",
    render(container) {
      const positionLabel = document.createElement("p");
      positionLabel.textContent = `Button position: ${getButtonCorner()}`;
      Object.assign(positionLabel.style, { margin: "0 0 8px" });
      const resetPositionButton = document.createElement("button");
      resetPositionButton.type = "button";
      resetPositionButton.textContent = "Reset to bottom-right";
      styleButton(resetPositionButton);
      resetPositionButton.addEventListener("click", () => {
        setButtonCorner("bottom-right");
        positionLabel.textContent = "Button position: bottom-right";
      });
      const siteLabel = document.createElement("p");
      siteLabel.textContent = `This site: ${location.hostname}`;
      Object.assign(siteLabel.style, { margin: "16px 0 8px" });
      const forgetButton = document.createElement("button");
      forgetButton.type = "button";
      forgetButton.textContent = "Forget this site (ask again)";
      styleButton(forgetButton);
      forgetButton.addEventListener("click", () => {
        clearSiteStatus(location.hostname);
        forgetButton.textContent = "Forgotten \u2014 will ask again on reload.";
        forgetButton.disabled = true;
        forgetButton.style.cursor = "default";
        forgetButton.style.opacity = ".6";
      });
      container.appendChild(positionLabel);
      container.appendChild(resetPositionButton);
      container.appendChild(siteLabel);
      container.appendChild(forgetButton);
    }
  };
  function styleButton(button) {
    Object.assign(button.style, {
      display: "block",
      width: "100%",
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid rgba(255,255,255,.2)",
      background: "transparent",
      color: "#f9fafb",
      cursor: "pointer",
      font: "inherit"
    });
  }

  // src/ui/tabs/sitesTab.ts
  var sitesTab = {
    id: "sites",
    label: "Sites",
    render(container) {
      const searchInput = document.createElement("input");
      searchInput.type = "search";
      searchInput.placeholder = "Search sites\u2026";
      Object.assign(searchInput.style, {
        display: "block",
        width: "100%",
        boxSizing: "border-box",
        padding: "8px 10px",
        marginBottom: "10px",
        borderRadius: "6px",
        border: "1px solid rgba(255,255,255,.2)",
        background: "transparent",
        color: "#f9fafb",
        font: "inherit"
      });
      const countLabel = document.createElement("p");
      Object.assign(countLabel.style, {
        margin: "0 0 8px",
        color: "#9ca3af",
        fontSize: "12px"
      });
      const tableWrap = document.createElement("div");
      Object.assign(tableWrap.style, {
        maxHeight: "46vh",
        overflowY: "auto"
      });
      const table = document.createElement("table");
      Object.assign(table.style, {
        width: "100%",
        borderCollapse: "collapse"
      });
      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");
      for (const text of ["Hostname", "Status", "Actions"]) {
        const th = document.createElement("th");
        th.textContent = text;
        Object.assign(th.style, {
          position: "sticky",
          top: "0",
          textAlign: "left",
          padding: "6px 8px",
          background: "#111827",
          borderBottom: "1px solid rgba(255,255,255,.15)",
          fontWeight: "600",
          fontSize: "12px",
          color: "#9ca3af"
        });
        headRow.appendChild(th);
      }
      thead.appendChild(headRow);
      const tbody = document.createElement("tbody");
      table.appendChild(thead);
      table.appendChild(tbody);
      tableWrap.appendChild(table);
      const emptyState = document.createElement("p");
      Object.assign(emptyState.style, {
        margin: "10px 0 0",
        color: "#9ca3af"
      });
      const renderRows = () => {
        const query = searchInput.value.trim().toLowerCase();
        const sites = getAllSiteStatuses().filter((site) => site.hostname.toLowerCase().includes(query));
        countLabel.textContent = `${sites.length} site${sites.length === 1 ? "" : "s"}`;
        tbody.innerHTML = "";
        emptyState.remove();
        if (sites.length === 0) {
          emptyState.textContent = query ? "No sites match." : "No sites classified yet.";
          container.appendChild(emptyState);
          return;
        }
        for (const site of sites) {
          tbody.appendChild(buildRow(site.hostname, site.isJobSite, renderRows));
        }
      };
      searchInput.addEventListener("input", renderRows);
      container.appendChild(searchInput);
      container.appendChild(countLabel);
      container.appendChild(tableWrap);
      renderRows();
    }
  };
  function buildRow(hostname, isJobSite, refresh) {
    const row = document.createElement("tr");
    Object.assign(row.style, {
      borderBottom: "1px solid rgba(255,255,255,.08)"
    });
    const nameCell = document.createElement("td");
    Object.assign(nameCell.style, {
      padding: "6px 8px",
      wordBreak: "break-all",
      verticalAlign: "middle"
    });
    const nameText = document.createElement("span");
    nameText.textContent = hostname;
    nameCell.appendChild(nameText);
    const statusCell = document.createElement("td");
    Object.assign(statusCell.style, { padding: "6px 8px", verticalAlign: "middle" });
    const statusButton = document.createElement("button");
    statusButton.type = "button";
    statusButton.title = "Click to toggle";
    statusButton.textContent = isJobSite ? "Job site" : "Not a job site";
    styleStatusTag(statusButton, isJobSite);
    statusButton.addEventListener("click", () => {
      setSiteStatus(hostname, !isJobSite);
      refresh();
    });
    statusCell.appendChild(statusButton);
    const actionsCell = document.createElement("td");
    Object.assign(actionsCell.style, {
      padding: "6px 8px",
      whiteSpace: "nowrap",
      textAlign: "right",
      verticalAlign: "middle"
    });
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    styleActionButton2(editButton);
    editButton.addEventListener("click", startEdit);
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    styleActionButton2(removeButton);
    removeButton.addEventListener("click", () => {
      clearSiteStatus(hostname);
      refresh();
    });
    actionsCell.appendChild(editButton);
    actionsCell.appendChild(removeButton);
    row.appendChild(nameCell);
    row.appendChild(statusCell);
    row.appendChild(actionsCell);
    function startEdit() {
      nameCell.innerHTML = "";
      const input = document.createElement("input");
      input.type = "text";
      input.value = hostname;
      Object.assign(input.style, {
        width: "100%",
        boxSizing: "border-box",
        padding: "4px 6px",
        borderRadius: "4px",
        border: "1px solid rgba(255,255,255,.3)",
        background: "#1f2937",
        color: "#f9fafb",
        font: "inherit"
      });
      nameCell.appendChild(input);
      input.focus();
      input.select();
      let committed = false;
      const commit = () => {
        if (committed) return;
        committed = true;
        const next = input.value.trim();
        if (next && next !== hostname) {
          renameSiteHostname(hostname, next);
        }
        refresh();
      };
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") commit();
        if (event.key === "Escape") {
          committed = true;
          refresh();
        }
      });
      input.addEventListener("blur", commit);
    }
    return row;
  }
  function styleStatusTag(button, isJobSite) {
    Object.assign(button.style, {
      font: "inherit",
      fontSize: "12px",
      padding: "4px 10px",
      borderRadius: "999px",
      border: "none",
      background: isJobSite ? "#2563eb" : "#374151",
      color: "#fff",
      cursor: "pointer",
      whiteSpace: "nowrap"
    });
  }
  function styleActionButton2(button) {
    Object.assign(button.style, {
      font: "inherit",
      fontSize: "12px",
      padding: "4px 8px",
      marginLeft: "6px",
      borderRadius: "6px",
      border: "1px solid rgba(255,255,255,.2)",
      background: "transparent",
      color: "#f9fafb",
      cursor: "pointer"
    });
  }

  // src/index.ts
  var BUTTON_ID = "offerextract-button";
  function init(config = {}) {
    if (window.self !== window.top) return;
    seedDefaultJobSitesOnce(config.loadDefaultJobSites ?? false);
    registerMenuTabs([jobExtractionTab, sitesTab, settingsTab]);
    const applyButtonVisibility = (isJobSite) => {
      if (isJobSite === false) {
        removeFloatingButton(BUTTON_ID);
      } else {
        installFloatingButton({
          id: BUTTON_ID,
          label: config.buttonLabel ?? "\u2630",
          onClick: toggleMenu
        });
      }
    };
    applyButtonVisibility(getSiteStatus(location.hostname));
    onSiteStatusChange((hostname, isJobSite) => {
      if (hostname === location.hostname) applyButtonVisibility(isJobSite);
    });
    registerMenuCommand(config.menuCommandLabel ?? "Open Offer Extract menu", openMenu);
    if (!hasAskedForSite(location.hostname)) {
      showSitePrompt();
    }
  }
  return __toCommonJS(src_exports);
})();
if (typeof window !== 'undefined') { window.TMOfferExtract = TMOfferExtract; }
//# sourceMappingURL=tampermonkey-offerextract.js.map
