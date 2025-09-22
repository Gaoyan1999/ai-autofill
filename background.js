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
    console.log("Message received in background:", message);
    if (!message.type) {
        sendResponse({ status: "error", reason: "No type specified" });
        return;
    }
    switch (message.type) {
        case "autoFillForm":
            const inputElements = message.data;
            askAI(inputElements);
            break;
        default:
            sendResponse({ status: "error", reason: "Unknown type" });
    }
});



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

    console.log(formContext);
    const autoFillPrompt = `
        You are a helpful AI assistant. The user has provided their personal info:
        - Name: Daniel Li
        - Email: daniel.li@example.com
        - Country: Australia
        - Likes newsletter: yes
        For the form fields listed above, please generate suggested values in JSON format.
        If any field does not have a matching value in the user's info, leave it empty. Do NOT fill with fake data and do not fill data with the value in placeholder.`;
    const suggestedValues = await languageModel.prompt(formContext + autoFillPrompt);

    console.log(suggestedValues);
}