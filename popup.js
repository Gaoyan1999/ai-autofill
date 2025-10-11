document.getElementById('autofillBtn').addEventListener('click', async () => {
    const autofillBtn = document.getElementById('autofillBtn');
    
    // Prevent multiple clicks by adding loading state
    if (autofillBtn.classList.contains('loading')) {
        return;
    }
    
    // Add loading state
    autofillBtn.classList.add('loading');
    autofillBtn.disabled = true;
    
    try {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const result = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: autoFillForm
        });
        const labelElements = result[0].result;
        // send message to background.js one by one
        // Process labelElements serially, waiting for each to finish before starting the next
        async function processSerially() {
            const progressContainer = document.getElementById('progressContainer');
            const progressText = document.getElementById('progressText');
            const progressFill = document.getElementById('progressFill');
            const totalFields = labelElements.length;
            
            // Show progress container
            progressContainer.classList.remove('hidden');
        
        for (let i = 0; i < labelElements.length; i++) {
            // Update progress
            const currentProgress = i + 1;
            const percentage = (currentProgress / totalFields) * 100;
            
            progressText.textContent = `Filling ${currentProgress}/${totalFields}`;
            progressFill.style.width = `${percentage}%`;
            
            const data = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ type: "autoFillForm", data: [labelElements[i]] }, (response) => {
                    resolve(response);
                });
            });
            if (data.status !== "ok") {
                continue;
            }
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: fillForm,
                args: [data.values]
            });
        }
        
        // Show completion
        progressText.textContent = 'Completed!';
        progressContainer.classList.add('completed');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            progressContainer.classList.add('hidden');
            progressContainer.classList.remove('completed');
            progressFill.style.width = '0%';
            
            // Remove loading state
            autofillBtn.classList.remove('loading');
            autofillBtn.disabled = false;
        }, 3000);
    }
    processSerially();
    } catch (error) {
        console.error('Error during autofill:', error);
        // Remove loading state on error
        autofillBtn.classList.remove('loading');
        autofillBtn.disabled = false;
    }
});

document.getElementById('openOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});
function autoFillForm() {
    const findLabelForInput = (input) => {
        // Method 1: Check for explicit label association via 'for' attribute
        if (input.id) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label && label.innerText.trim()) {
                return label.innerText.trim();
            }
        }
        // Method 2: Find the nearest label element before the input
        let current = input.previousElementSibling;
        while (current) {
            if (current.tagName === 'LABEL' && current.innerText.trim()) {
                return current.innerText.trim();
            }
            current = current.previousElementSibling;
        }

        // Method 3: If not found in siblings, search in parent container
        let parent = input.parentElement;
        while (parent && parent !== document.body) {
            const labelsInParent = parent.querySelectorAll('label');
            for (const label of labelsInParent) {
                if (label.innerText.trim()) {
                    return label.innerText.trim();
                }
            }
            parent = parent.parentElement;
        }

        return null;
    }
    const extractInputInfo = (input, index) => {
        // Add a unique custom attribute to identify this element
        const uniqueId = `ai-autofill-${Date.now()}-${index}`;
        input.setAttribute('data-ai-autofill-id', uniqueId);
        if (input.type === "select-one") {
            // find all the options in the select
            const options = Array.from(input.querySelectorAll("option"));
            const label = findLabelForInput(input);
            return {
                label: [input.id, input.name, label].filter(Boolean).join(" | "),
                type: input.type,
                placeholder: input.placeholder,
                options: options.map((option) => {
                    return `${option.value}`;
                }),
                aiAutofillId: uniqueId
            }
        }

        const label = findLabelForInput(input);
        return {
            label: [input.id, input.name, label].filter(Boolean).join(" | "),
            type: input.type,
            placeholder: input.placeholder,
            aiAutofillId: uniqueId  // Include the custom ID for later reference
        };
    }
    const isEmpty = (value) => {
        return value === null || value === undefined || value === "";
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
        const extracted = inputElements.map((input, index) => extractInputInfo(input, index))
            // filter out the elements that haven't clear meaning.
            .filter(info => !isEmpty(info.label));
        console.log("extracted:", extracted);
        return extracted;
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

