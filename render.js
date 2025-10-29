// renderer.js — minimal UI logic
const urlInput = document.getElementById('url');
const goBtn = document.getElementById('go');
const backBtn = document.getElementById('back');
const forwardBtn = document.getElementById('forward');
const iframe = document.getElementById('web');
const clearBtn = document.getElementById('clear');

function normalizeUrl(u) {
  if (!u) return '';
  if (!/^[a-zA-Z]+:\/\//.test(u)) u = 'https://' + u;
  return u;
}

goBtn.addEventListener('click', () => {
  const url = normalizeUrl(urlInput.value.trim());
  if (url) iframe.src = url;
});

urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') goBtn.click();
});

backBtn.addEventListener('click', () => {
  try { iframe.contentWindow.history.back(); } catch (e) {}
});
forwardBtn.addEventListener('click', () => {
  try { iframe.contentWindow.history.forward(); } catch (e) {}
});

clearBtn.addEventListener('click', () => {
  // Close the window which triggers main to clear data and quit
  window.close();
});
