// background.js
console.log("Background service worker started.");
let languageModel;
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
                    const suggestedValues = await askAI(inputElements);
                    sendResponse({ status: "ok", values: suggestedValues });
                } catch (err) {
                    sendResponse({ status: "error", reason: err.message });
                }
            })();
            return true;
        default:
            sendResponse({ status: "error", reason: "Unknown type" });
            return false;
    }
});;



async function askAI(inputElements) {
    if (!languageModel) {
        languageModel = await LanguageModel.create({
            initialPrompts: [{
                role: 'system',
                content: 'You are a helpful assistant that can read a webpage form context and suggest appropriate auto-fill values.'
            }],
        });
    }
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
        - Name: Daniel Li
        - Email: daniel.li@example.com
        - Country: Australia
        - Likes newsletter: yes
        - Work phone: +61 0402809602
    \n\n
    The form fields are listed above. Please return **only a JSON array of strings**, in the same order as the fields, containing suggested values.
    If the user's info does not provide a value for a field, leave it as an empty string "".
    Do NOT return any text outside the JSON array.`;
    console.log(formContext + autoFillPrompt);
    const aiResponse = await languageModel.prompt(formContext + "\n\n" + autoFillPrompt);
    console.log('aiReponse:',aiResponse);
    const resultsArray = handleAiJsonResponse(aiResponse);
    console.log("processed:",resultsArray);
    resultsArray.forEach((answer, index) => {
        inputElements[index].aiAnswer = answer;
    });
    return inputElements;
}

function handleAiJsonResponse(jsonstring) {
    const match = jsonstring.match(/```json\s*([\s\S]*?)```/i);
    return JSON.parse(match ? match[1].trim() : jsonstring);
}