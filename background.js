/* global browser */

function notify(title, message = "", iconUrl = "icon.png") {
  try {
    const nid = browser.notifications.create("" + Date.now(), {
      type: "basic",
      iconUrl,
      title,
      message,
    });
    if (nid > -1) {
      setTimeout(() => {
        browser.notifications.clear(nid);
      }, 2000);
    }
  } catch (e) {
    // noop
  }
}

browser.menus.create({
  title: "For None DRM protected media",
  contexts: ["video"],
  onclick: async (info, tab) => {
    try {
      const dataURI = await browser.tabs.executeScript(tab.id, {
        frameId: info.frameId,
        code: `(() => {
            const vidEl = browser.menus.getTargetElement(${info.targetElementId});
            const canvas = document.createElement("canvas");
            canvas.width = vidEl.videoWidth;
            canvas.height= vidEl.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(vidEl, 0, 0, vidEl.videoWidth, vidEl.videoHeight);
            return canvas.toDataURL("image/png", 1.0);
        })();`,
      });

      const blob = await (await fetch(dataURI)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);

      //iconBlink();
      notify("Copy Video Frame", "copied video frame");
    } catch (e) {
      notify(
        "Copy Video Frame",
        "failed to copy video frame:\n" + e.toString(),
      );
    }
  },
});

browser.menus.create({
  title: "For DRM protected media",
  contexts: ["video"],
  onclick: async (info, tab) => {
    try {
      let elBrect = await browser.tabs.executeScript(tab.id, {
        frameId: info.frameId,
        code: `(() => {
    const vidEl = browser.menus.getTargetElement(${info.targetElementId});
    const tmp = vidEl.getBoundingClientRect();
    let element = vidEl;
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    if(vidEl.hasAttribute('contorls')){
     vidEl.removeAttribute('controls');
    setTimeout(() => {
     vidEl.setAttribute('controls',"");
        },1000);
    }

    return {
        x: left,
        y: top,
        width: tmp.width,
        height: tmp.height
    };
})();`,
      });

      elBrect = elBrect[0];

      const dataURI = await browser.tabs.captureVisibleTab(tab.windowId, {
        rect: elBrect,
      });

      const blob = await (await fetch(dataURI)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);

      notify("Copy Video Frame", "copied video frame");
    } catch (e) {
      console.error(e);
      notify(
        "Copy Video Frame",
        "failed to copy video frame:\n" + e.toString(),
      );
    }
  },
});
