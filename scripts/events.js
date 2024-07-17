// Function to handle showing the page action
function showPageAction(tabId) {
    chrome.action.enable(tabId);
}

// Function to handle toggling the slider
function toggleSlider(tabId) {
    chrome.tabs.sendMessage(tabId, { todo: "toggle" });
}

// Listener for messages to show the page action
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.todo === "showPageAction") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                showPageAction(tabs[0].id);
            }
        });
    }
});

// Listener for when the extension icon is clicked
chrome.action.onClicked.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
            toggleSlider(tabs[0].id);
        }
    });
});
