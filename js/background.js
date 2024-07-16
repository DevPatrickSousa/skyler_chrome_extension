import { createNewTabAndCapture } from './helpers.js';

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.action === 'captureTab') {
    const tabIndex = request.tabIndex;
    chrome.tabs.query({}, function (tabs) {
      if (tabIndex > 0 && tabIndex <= tabs.length) {
        const tab = tabs[tabIndex - 1];
        createNewTabAndCapture(tab.url, function (screenshotDataUrl) {
          response({ success: true, screenshotDataUrl: screenshotDataUrl });
        });
      } else {
        response({ success: false, message: "Página inválida." });
      }
    });
    return true;
  }
});
