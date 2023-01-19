// @ts-nocheck Since this file adds info to globalThis as to simulate a browser
// on a Deno environment, it is better to disable type checking and code coverage
// for this file
let windowObj: Window;

if("Deno" in globalThis){
  // running in Deno
  const { JSDOM } = await import("https://esm.sh/v102/jsdom@20.0.3")
  const jsdom = new JSDOM(
    `<!DOCTYPE html>
  <html lang="en">
    <head>
      <title>Hello from Deno</title>
    </head>
    <body>
    </body>
  </html>`,
    {
      url: "https://example.com/",
      referrer: "https://example.org/",
      contentType: "text/html",
      storageQuota: 10000000,
    },
  );
  
  windowObj = jsdom.window as Window 
  globalThis.requestAnimationFrame = windowObj.requestAnimationFrame
  globalThis.cancelAnimationFrame = windowObj.cancelAnimationFrame
  globalThis.requestIdleCallback = windowObj.requestIdleCallback
  globalThis.cancelIdleCallback = windowObj.cancelIdleCallback
  globalThis.ShadowRoot = windowObj.ShadowRoot
  globalThis.MutationObserver = windowObj.MutationObserver
  globalThis.CustomEvent = windowObj.CustomEvent
} else {
  windowObj = globalThis.window 
}

export const window = windowObj 
export const document = window.document