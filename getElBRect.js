(() => {
  /* const vidEl = browser.menus.getTargetElement(${info.targetElementId}); */
  /* vidEl is set with a prior executeScript call in the global content script scope */
  if (typeof vidEl === "undefined") {
    throw new Error(
      "Failed to process video element\nIf possible please report this issue on the support site.",
    );
  }
  const tmp = vidEl.getBoundingClientRect();
  let element = vidEl;
  var top = 0,
    left = 0;
  do {
    top += element.offsetTop || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent;
  } while (element);

  /*
   * hide generic html5 controls
   */
  if (vidEl.hasAttribute("controls")) {
    vidEl.removeAttribute("controls");
    setTimeout(() => {
      vidEl.setAttribute("controls", "");
    }, 2000);
  }

  function brieflyHide(selector) {
    const el = document.querySelector(selector);
    if (el !== null) {
      el_style_display = el.style.display;
      el.style.display = "none";
      setTimeout(() => {
        el.style.display = el_style_display;
      }, 2000);
    }
  }
  // hide: title and some buttons (watch later, share)
  brieflyHide(".ytp-chrome-top");
  // hide: fake controls
  brieflyHide(".ytp-chrome-bottom");
  // remove fake contextmenus
  Array.from(document.querySelectorAll(".ytp-contextmenu")).forEach((el) => {
    el.remove();
  });

  return {
    x: left,
    y: top,
    width: tmp.width,
    height: tmp.height,
  };
})();
