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
  title: "Copy Video Frame",
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

    /* html5 controls */
    if(vidEl.hasAttribute('controls')){
        vidEl.removeAttribute('controls');
        setTimeout( () => {
            vidEl.setAttribute('controls',"");
        },1500);
    }

    /* yt workarounds >>> */

    // hide pseudo video controls
    const ytcb = document.querySelector('.ytp-chrome-bottom');
    if(ytcb !== null){
        ytcb_style_display = ytcb.style.display;
        ytcb.style.display = 'none';
        setTimeout( () => {
            ytcb.style.display = ytcb_style_display;
        },1500);
    }
    // remove pseudo context menu
    Array.from(document.querySelectorAll('.ytp-contextmenu')).forEach( el => {
        el.remove();
    });
    /* <<< yt workarounds */

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
      notify("Copy Video Frame", "Image in clipboard\n(paste with CTRL+V)");
    } catch (e) {
      console.error(e);
      notify("Copy Video Frame", "Failed:\n" + e.toString());
    }
  },
});
