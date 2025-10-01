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

    const formContext = inputElements.map((el, idx) => {

        const fieldInfo = {};
        if (el.id) fieldInfo.id = el.id;
        if (el.name) fieldInfo.name = el.name;
        if (el.type) fieldInfo.type = el.type;
        if (el.placeholder) fieldInfo.placeholder = el.placeholder;
        if (el.label) fieldInfo.label = el.label;
        if (el.value) fieldInfo.value = el.value;

        const textLines = Object.entries(fieldInfo)
            .map(([key, val]) => `${key}: ${val}`)
            .join("\n");

        return `${idx + 1}. Field Info:\n${textLines}`;
    }).join("\n\n");

    const autoFillPrompt = `

        You are a helpful AI assistant. The user has provided their personal info:
        ${personalInfo}

        Here are some attachments that the user has provided:
        ${personalDataSet.attachments?.map((attachment) => `- ${attachment.name}: ${attachment.content}`).join("\n")}

        The form fields are listed below:
        ${formContext}

        Your task:
        1. Return **only a JSON array of strings**.
        2. The array **must have exactly the same length as the number of form fields (the number would be ${inputElements.length}) ** (one value for each field, in the same order).
        3. If the user's info does not provide a value for a field, output an empty string "" for that position.
        4. Do **not** add explanations, comments, or any text outside the JSON array.
`;
    console.log('autoFillPrompt:', autoFillPrompt);
    const aiResponse = await languageModel.prompt(autoFillPrompt);
    console.log('aiResponse:', aiResponse);
    const resultsArray = handleAiJsonResponse(aiResponse);
    console.log("processed aiResponse:", resultsArray);
    resultsArray.forEach((answer, index) => {
        inputElements[index].aiAnswer = answer;
    });
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