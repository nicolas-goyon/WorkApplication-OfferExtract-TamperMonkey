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
  function readMap() {
    return getValue(SITE_STATUS_KEY, {});
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
  }
  function clearSiteStatus(hostname) {
    const map = readMap();
    delete map[hostname];
    setValue(SITE_STATUS_KEY, map);
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
    if (panelEl) panelEl.style.display = "none";
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
      width: "300px",
      maxHeight: "70vh",
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
    const box = document.createElement("div");
    box.id = PROMPT_ID;
    Object.assign(box.style, {
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
    Object.assign(box.style, cornerStyles(getButtonCorner(), PROMPT_MARGIN));
    const question = document.createElement("p");
    question.textContent = "Is this a job-related website (job board, ATS, application form)?";
    Object.assign(question.style, { margin: "0 0 12px" });
    box.appendChild(question);
    const row = document.createElement("div");
    Object.assign(row.style, { display: "flex", gap: "8px" });
    const answer = (isJobSite) => {
      setSiteStatus(location.hostname, isJobSite);
      box.remove();
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
    box.appendChild(row);
    document.body.appendChild(box);
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

  // src/ui/tabs/jobExtractionTab.ts
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
      const refresh = () => {
        const status = getSiteStatus(hostname);
        statusLine.textContent = describeStatus(hostname, status);
        setActive(yesButton, status === true);
        setActive(noButton, status === false);
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
      const placeholder = document.createElement("p");
      placeholder.textContent = "Offer extraction is coming soon.";
      Object.assign(placeholder.style, {
        margin: "0",
        color: "#9ca3af"
      });
      container.appendChild(statusLine);
      container.appendChild(toggleRow);
      container.appendChild(placeholder);
      refresh();
    }
  };
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

  // src/shared/ui/notify.ts
  function observeAndReinstallButton(install) {
    const observer = new MutationObserver(() => {
      if (!document.body) return;
      install();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // src/index.ts
  var BUTTON_ID = "offerextract-button";
  function init(config = {}) {
    registerMenuTabs([jobExtractionTab, settingsTab]);
    const install = () => installFloatingButton({
      id: BUTTON_ID,
      label: config.buttonLabel ?? "\u2630",
      onClick: toggleMenu
    });
    install();
    observeAndReinstallButton(install);
    registerMenuCommand(config.menuCommandLabel ?? "Open Offer Extract menu", openMenu);
    if (!hasAskedForSite(location.hostname)) {
      showSitePrompt();
    }
  }
  return __toCommonJS(src_exports);
})();
if (typeof window !== 'undefined') { window.TMOfferExtract = TMOfferExtract; }
//# sourceMappingURL=tampermonkey-offerextract.js.map
