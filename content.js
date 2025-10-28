const browserAPI = typeof browser !== "undefined" ? browser : chrome;

let isEnabled = false;
let styleElement = null;

const fontFamilies = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
    serif: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif',
    georgia: "Georgia, serif",
    verdana: "Verdana, sans-serif"
};

function createStyles(settings) {
    const fontFamily = fontFamilies[settings.fontFamily] || fontFamilies.system;

    return `
    body.readable-mode {
      max-width: ${settings.maxWidth}px !important;
      margin: 40px auto !important;
      padding: 0 20px !important;
      font-family: ${fontFamily} !important;
      font-size: ${settings.fontSize}px !important;
      line-height: ${settings.lineHeight} !important;
      color: #1a1a1a !important;
      background: #ffffff !important;
    }
    
    body.readable-mode * {
      max-width: 100% !important;
    }
    
    body.readable-mode p,
    body.readable-mode li,
    body.readable-mode blockquote {
      font-size: ${settings.fontSize}px !important;
      line-height: ${settings.lineHeight} !important;
    }
    
    body.readable-mode h1,
    body.readable-mode h2,
    body.readable-mode h3,
    body.readable-mode h4,
    body.readable-mode h5,
    body.readable-mode h6 {
      line-height: 1.3 !important;
      margin-top: 1.5em !important;
      margin-bottom: 0.5em !important;
    }
    
    body.readable-mode pre,
    body.readable-mode code {
      font-size: ${Math.max(14, settings.fontSize - 2)}px !important;
    }
    
    body.readable-mode img {
      max-width: 100% !important;
      height: auto !important;
    }
  `;
}

function applyStyles(settings) {
    if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = "readable-mode-styles";
        document.head.appendChild(styleElement);
    }

    styleElement.textContent = createStyles(settings);
}

function toggleReadableMode(enabled, settings) {
    isEnabled = enabled;

    if (enabled) {
        applyStyles(settings);
        document.body.classList.add("readable-mode");
    } else {
        document.body.classList.remove("readable-mode");
        if (styleElement) {
            styleElement.remove();
            styleElement = null;
        }
    }
}

// Load initial state
browserAPI.storage.sync.get(["enabled", "fontSize", "maxWidth", "lineHeight", "fontFamily"]).then((result) => {
    const settings = {
        fontSize: result.fontSize || 18,
        maxWidth: result.maxWidth || 650,
        lineHeight: result.lineHeight || 1.6,
        fontFamily: result.fontFamily || "system"
    };

    toggleReadableMode(result.enabled || false, settings);
});

// Listen for messages from popup
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggle") {
        browserAPI.storage.sync.get(["fontSize", "maxWidth", "lineHeight", "fontFamily"]).then((result) => {
            const settings = {
                fontSize: result.fontSize || 18,
                maxWidth: result.maxWidth || 650,
                lineHeight: result.lineHeight || 1.6,
                fontFamily: result.fontFamily || "system"
            };
            toggleReadableMode(request.enabled, settings);
        });
    } else if (request.action === "update") {
        if (isEnabled) {
            applyStyles(request.settings);
        }
    }
});
