(function () {
  try {
    var stored = localStorage.getItem('lit-001-theme');
    var preference =
      stored === 'light' || stored === 'dark' || stored === 'system'
        ? stored
        : 'system';
    var resolved =
      preference === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : preference;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  } catch (_) {
    document.documentElement.dataset.theme = 'light';
  }
})();
