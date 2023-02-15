"use strict";

var observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    } else {
      entry.target.classList.remove('show');
    }
  });
});
var hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach(function (element) {
  return observer.observe(element);
});
