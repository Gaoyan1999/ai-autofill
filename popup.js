document.getElementById('autofillBtn').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: autoFillForm
    });
    const labelElements = result[0].result;
    chrome.runtime.sendMessage({ type: "autoFillForm", data: labelElements }, (data) => {
        if (data.status !== "ok") {
            return;
        }
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: fillForm,
            args: [data.values]
        });
    });

});

document.getElementById('openOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});
function autoFillForm() {
    const extractInputInfo = (input) => {
        return {
            id: input.id,
            name: input.name,
            type: input.type,
            placeholder: input.placeholder,
            label: (() => {
                const label = document.querySelector(`label[for="${input.id}"]`);
                return label ? label.innerText : null;
            })()
        };
    }
    const forms = document.querySelectorAll("form");
    if (forms.length > 0) {
        // TODO: identify the element that seems to be the form
        const targetForm = forms[0];
        // find all the input elements in the form
        const inputElements = Array.from(targetForm.querySelectorAll("input, textarea, select"))
            .filter(el => {
                const style = window.getComputedStyle(el);
                const visible = style.display !== "none" &&
                    style.visibility !== "hidden" &&
                    el.offsetParent !== null;
                const notDisabled = !el.disabled && el.type !== "hidden";
                const notReadonly = !el.readOnly;
                const isEmpty = !el.value || el.value.trim() === "";
                return visible && notDisabled && notReadonly && isEmpty;
            });
        const extracted = inputElements.map(extractInputInfo);
        return extracted;

        // TODO: auto fill select    
        // find all the select elements in the form
        // const selectElements = targetForm.querySelectorAll("select");
        // console.log(selectElements);
    } else {
        alert("No form found on this page.");
    }
}

function fillForm(aiResult) {
    if (!Array.isArray(aiResult)) {
        return;
    }

    aiResult.forEach(el => {
        let input = document.querySelector(`[name="${el.name}"]`);
        if (!input && el.id) {
            input = document.getElementById(el.id);
        }
        if (!input) {
            return;
        }
        input.value = el.aiAnswer;
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });

}




