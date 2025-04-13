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
    }, 1500);
  }

  /*
   * hide fake youtube controls and contextmenu
   */
  const ytcb = document.querySelector(".ytp-chrome-bottom");
  if (ytcb !== null) {
    ytcb_style_display = ytcb.style.display;
    ytcb.style.display = "none";
    setTimeout(() => {
      ytcb.style.display = ytcb_style_display;
    }, 1500);
  }
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
