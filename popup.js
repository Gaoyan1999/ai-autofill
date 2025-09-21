document.getElementById('clickBtn').addEventListener('click', () => {
    alert('Hello World from Chrome Plugin!');
});

document.getElementById('openOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});
