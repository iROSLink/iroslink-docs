document.addEventListener("DOMContentLoaded", function () {
  var storageKey = "irl-tasklist:" + window.location.pathname;

  function load() {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
    catch (e) { return {}; }
  }

  function save(states) {
    try { localStorage.setItem(storageKey, JSON.stringify(states)); }
    catch (e) {}
  }

  var boxes = document.querySelectorAll(".task-list-item input[type='checkbox']");
  var states = load();

  boxes.forEach(function (cb, i) {
    if (states[i] !== undefined) cb.checked = states[i];
    cb.addEventListener("change", function () {
      states[i] = cb.checked;
      save(states);
    });
  });
});
