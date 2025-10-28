const browserAPI = typeof browser !== "undefined" ? browser : chrome;

const toggle = document.getElementById("toggle");
const applyBtn = document.getElementById("apply");
const fontSizeInput = document.getElementById("fontSize");
const maxWidthInput = document.getElementById("maxWidth");
const lineHeightInput = document.getElementById("lineHeight");
const fontFamilyInput = document.getElementById("fontFamily");

// Update display values
fontSizeInput.addEventListener("input", (e) => {
    document.getElementById("fontSize-value").textContent = e.target.value + "px";
});

maxWidthInput.addEventListener("input", (e) => {
    document.getElementById("maxWidth-value").textContent = e.target.value + "px";
});

lineHeightInput.addEventListener("input", (e) => {
    document.getElementById("lineHeight-value").textContent = e.target.value;
});

// Load saved settings
browserAPI.storage.sync.get(["enabled", "fontSize", "maxWidth", "lineHeight", "fontFamily"]).then((result) => {
    const enabled = result.enabled || false;
    updateToggleButton(enabled);

    if (result.fontSize) fontSizeInput.value = result.fontSize;
    if (result.maxWidth) maxWidthInput.value = result.maxWidth;
    if (result.lineHeight) lineHeightInput.value = result.lineHeight;
    if (result.fontFamily) fontFamilyInput.value = result.fontFamily;

    // Update displays
    document.getElementById("fontSize-value").textContent = fontSizeInput.value + "px";
    document.getElementById("maxWidth-value").textContent = maxWidthInput.value + "px";
    document.getElementById("lineHeight-value").textContent = lineHeightInput.value;
});

toggle.addEventListener("click", async () => {
    const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });

    const result = await browserAPI.storage.sync.get(["enabled"]);
    const newState = !result.enabled;
    await browserAPI.storage.sync.set({ enabled: newState });

    browserAPI.tabs.sendMessage(tab.id, { action: "toggle", enabled: newState }).catch((err) => {
        console.log("Error sending message:", err);
    });
    updateToggleButton(newState);
});

applyBtn.addEventListener("click", async () => {
    const settings = {
        fontSize: fontSizeInput.value,
        maxWidth: maxWidthInput.value,
        lineHeight: lineHeightInput.value,
        fontFamily: fontFamilyInput.value
    };

    await browserAPI.storage.sync.set(settings);

    const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });
    browserAPI.tabs.sendMessage(tab.id, { action: "update", settings }).catch((err) => {
        console.log("Error sending message:", err);
    });
});

function updateToggleButton(enabled) {
    if (enabled) {
        toggle.textContent = "Disable Readable Mode";
        toggle.classList.remove("off");
    } else {
        toggle.textContent = "Enable Readable Mode";
        toggle.classList.add("off");
    }
}
