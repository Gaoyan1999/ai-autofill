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
    const extractInputInfo = (input, index) => {
        // Add a unique custom attribute to identify this element
        const uniqueId = `ai-autofill-${Date.now()}-${index}`;
        input.setAttribute('data-ai-autofill-id', uniqueId);
        if (input.type === "select-one") {
            // find all the options in the select
            const options = Array.from(input.querySelectorAll("option"));
            return {
                id: input.id,
                name: input.name,
                type: input.type,
                placeholder: input.placeholder,
                options: options.map((option) => {
                    return `${option.value}`;
                }),
                aiAutofillId: uniqueId
            }
        }

        return {
            id: input.id,
            name: input.name,
            type: input.type,
            placeholder: input.placeholder,
            aiAutofillId: uniqueId  // Include the custom ID for later reference
        };
    }
    // Only select forms that are not inside <header>, <script>, <style>, <nav>, or <footer>
    const forms = Array.from(document.querySelectorAll("form")).filter(form => {
        let parent = form.parentElement;
        while (parent) {
            const tag = parent.tagName && parent.tagName.toLowerCase();
            if (["header", "script", "style", "nav", "footer"].includes(tag)) {
                return false;
            }
            parent = parent.parentElement;
        }
        return true;
    });
    if (forms.length === 1) {
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
        const extracted = inputElements.map((input, index) => extractInputInfo(input, index));
        return extracted;

        // TODO: auto fill select    
        // find all the select elements in the form
        // const selectElements = targetForm.querySelectorAll("select");
        // console.log(selectElements);
    }
    else if (forms.length > 1) {
        // TODO: show a list of forms and let the user select the form they want to fill
        alert("Multiple forms found on this page. Please select the form you want to fill.");
    } else {
        alert("No form found on this page.");
    }
}

function fillForm(aiResult) {
    if (!Array.isArray(aiResult)) {
        return;
    }

    // Add CSS for highlighting if not already present
    if (!document.getElementById('ai-autofill-highlight-style')) {
        const style = document.createElement('style');
        style.id = 'ai-autofill-highlight-style';
        style.textContent = `
            .ai-autofill-highlight {
                background-color: #f0fdf4 !important;
                border: 1px solid #bbf7d0 !important;
                box-shadow: 0 0 8px rgba(187, 247, 208, 0.3) !important;
                transition: all 0.4s ease !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Helper function to scroll to element smoothly
    const scrollToElement = (element) => {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
    };

    // Helper function to fill a single input
    const fillSingleInput = (el) => {
        return new Promise((resolve) => {
            // Find the input element
            let input = document.querySelector(`[data-ai-autofill-id="${el.aiAutofillId}"]`);

            // Fallback to name attribute if custom ID not found
            if (!input && el.name) {
                input = document.querySelector(`[name="${el.name}"]`);
            }

            // Fallback to ID if still not found
            if (!input && el.id) {
                input = document.getElementById(el.id);
            }

            if (!input) {
                resolve();
                return;
            }

            // Scroll to the element
            scrollToElement(input);

            // Wait a bit for scroll animation, then fill
            setTimeout(() => {
                // Fill the input
                if (el.type === "select-one") {
                    // find the option with the value of el.aiAnswer
                    const option = input.querySelector(`option[value="${el.aiAnswer}"]`);
                    if (option) {
                        option.selected = true;
                    }
                    input.dispatchEvent(new Event("change", { bubbles: true }));
                } else {

                    input.value = el.aiAnswer;
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                }


                // Add highlight effect
                input.classList.add('ai-autofill-highlight');

                // Remove highlight after 5 seconds
                setTimeout(() => {
                    input.classList.remove('ai-autofill-highlight');
                }, 5000);

                // Clean up the custom attribute after successful fill
                input.removeAttribute('data-ai-autofill-id');

                // Wait a bit before moving to next element
                setTimeout(() => {
                    resolve();
                }, 800);
            }, 300);
        });
    };

    // Fill inputs sequentially
    const fillSequentially = async () => {
        for (let i = 0; i < aiResult.length; i++) {
            await fillSingleInput(aiResult[i], i);
        }
    };

    // Start the sequential filling
    fillSequentially();
}