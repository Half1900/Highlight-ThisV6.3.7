let creating; // A global promise to avoid concurrency issues
export async function setupOffscreenDocument(path) {
  // Check all windows controlled by the service worker to see if one 
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  },()=>chrome.runtime.lastError);

  if (existingContexts?.length > 0) {
    return;
  }

  // create offscreen document
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['BLOBS'],
      justification: 'reason for needing the document',
    },()=>chrome.runtime.lastError);
    await creating;
    creating = null;
  }
}