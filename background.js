// background.js
console.log("Background service worker started.");
let languageModel;
const STORAGE_KEY = "personalDataSet";

/**
  type: autoFillForm
  data: inputElements
   type InputElement {
    id: string
    name: string
    type: string
    placeholder: string
    label: string
    value: string
    }
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message.type) {
        sendResponse({ status: "error", reason: "No type specified" });
        return false;
    }
    switch (message.type) {
        case "autoFillForm":
            const inputElements = message.data;
            (async () => {
                try {
                    const suggestedValues = await fillElementsWithAI(inputElements);
                    sendResponse({ status: "ok", values: suggestedValues });
                } catch (err) {
                    sendResponse({ status: "error", reason: err.message });
                }
            })();
            return true;

        case "informationExtract":
            const text = message.data;
            (async () => {
                try {
                    const information = await extractInformationWithAI(text);
                    sendResponse({ status: "ok", values: information });
                } catch (err) {
                    sendResponse({ status: "error", reason: err.message });
                }
            })();
            return true;
        default:
            sendResponse({ status: "error", reason: "Unknown type" });
            return false;
    }
});

// Function to retrieve personal data from Chrome storage
async function getPersonalData() {
    return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            const personalDataSet = result[STORAGE_KEY];
            resolve(personalDataSet || { sections: [] });
        });
    });
}

// Function to format personal data for AI prompt
function formatPersonalInfo(personalDataSet) {
    if (!personalDataSet || !personalDataSet.sections) {
        return "No personal information available.";
    }

    const personalInfoLines = [];

    personalDataSet.sections.forEach(section => {
        if (section.items && section.items.length > 0) {
            personalInfoLines.push(`${section.category}:`);
            section.items.forEach(item => {
                if (item.label && item.value) {
                    personalInfoLines.push(`- ${item.label}: ${item.value}`);
                }
            });
        }
    });

    return personalInfoLines.length > 0
        ? personalInfoLines.join('\n        ')
        : "No personal information available.";
}

async function initLanguageModel() {
    languageModel = await LanguageModel.create({
        initialPrompts: [{
            role: 'system',
            content: 'You are a helpful assistant that can read a webpage form context and suggest appropriate auto-fill values.'
        }],
    });
}

async function fillElementsWithAI(inputElements) {
    if (!languageModel) {
        await initLanguageModel();
    }

    // Retrieve personal data from storage
    const personalDataSet = await getPersonalData();
    const personalInfo = formatPersonalInfo(personalDataSet);

    // Process each element one by one
    for (let i = 0; i < inputElements.length; i++) {
        const element = inputElements[i];

        const fieldInfo = {};
        if (element.label) fieldInfo.label = element.label;
        if (element.options) fieldInfo.options = element.options;
        if (element.placeholder) fieldInfo.placeholder = element.placeholder;
        if (element.value) fieldInfo.value = element.value;

        const textLines = Object.entries(fieldInfo)
            .map(([key, val]) => `${key}: ${val}`)
            .join("\n");

        const singleFieldPrompt = `
            You are a helpful AI assistant. The user has provided their personal info:
            ${personalInfo}

            Here are some attachments that the user has provided:
            ${personalDataSet.attachments?.map((attachment) => `- ${attachment.name}: ${attachment.content}`).join("\n")}

            You need to fill this specific form field:
            Field Info:
            ${textLines}

            Your task: return **only a single string value** for this field.
            1. Return **only a string value** (not an array, not JSON, just the value).
            2. If the user's info does not provide a value for this field, return an empty string "".
            3. Do **not** add explanations, comments, or any text outside the value.
            4. The value should be appropriate for the field type and context.
        `;

        console.log(`Processing field ${i + 1}/${inputElements.length}:`, fieldInfo);
        const aiResponse = await languageModel.prompt(singleFieldPrompt);
        console.log(`AI response for field ${i + 1}:`, aiResponse);

        // Clean the response - remove any extra text and get just the value
        let cleanValue = aiResponse.trim();

        // Remove quotes if the AI wrapped the value in quotes
        if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
            (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
            cleanValue = cleanValue.slice(1, -1);
        }

        // Handle special cases
        if (cleanValue === 'undefined' || cleanValue === 'null' || cleanValue === 'null' || cleanValue === 'undefined') {
            cleanValue = '';
        }

        inputElements[i].aiAnswer = cleanValue;
    }

    return inputElements;
}


async function extractInformationWithAI(text) {
    if (!languageModel) {
        await initLanguageModel();
    }

    const extractPrompt = `
        You are a helpful assistant that can extract information from a text.
        The text is:
        Context:
        ${text}
        
        Your task:
        1. Return **only a JSON of strings**.
        2. Extract key information from Context, and put it in a JSON format.
           The object should be like this:
           sections: { category: string; items: InfoData[] }[];
           Example:
           {
            sections: [
                { category: "Personal Info", items: [{ label: "Name", value: "John Doe" }, { label: "Email", value: "john.doe@example.com" }] },
                { category: "Education", items: [{ label: "School", value: "University of Example" }, { label: "Major", value: "Computer Science" }] }
            ]
           }
    `;
    const aiResponse = await languageModel.prompt(extractPrompt);
    console.log('aiResponse:', aiResponse);
}


function handleAiJsonResponse(jsonstring) {
    const match = jsonstring.match(/```json\s*([\s\S]*?)```/i);
    const object = JSON.parse(match ? match[1].trim() : jsonstring);
    if (Array.isArray(object)) {
        return object.map(item => {
            if (item === 'undefined' || item === 'null') {
                return '';
            }
            return item;
        });
    } else {
        return [];
    }
}


chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "autoFillSelection",
        title: "AI Auto-Fill",
        contexts: ["all"]
    });
});


chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "autoFillSelection") {
        const [result] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const extractInputInfo = (input) => {
                    // Add a unique custom attribute to identify this element
                    const uniqueId = `ai-autofill-${Date.now()}`;
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
                const el = document.activeElement;
                return extractInputInfo(el);
            }
        });
        const suggestedValues = await fillElementsWithAI([result.result]);
        // fill the suggested values
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: fillField,
            args: [suggestedValues]
        });
    }
});

// TODO: refactor this function. It duplicates the code in popup.js
function fillField(aiResult) {
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


