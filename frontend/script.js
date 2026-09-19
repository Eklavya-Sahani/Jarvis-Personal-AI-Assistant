// ==========================================
// JARVIS - PERSONAL AI ASSISTANT
// Frontend JavaScript
// ==========================================


// ==========================================
// API
// ==========================================

const API_URL = "/chat";


// ==========================================
// DOM ELEMENTS
// ==========================================

const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const micButton = document.getElementById("micButton");
const listeningStatus = document.getElementById("listeningStatus");


// ==========================================
// STATE
// ==========================================

let isListening = false;
let recognition = null;


// ==========================================
// ADD USER MESSAGE
// ==========================================

function addUserMessage(message) {

    const messageElement = document.createElement("div");

    messageElement.className = "message user-message";

    messageElement.innerHTML = `
        <div class="avatar user-avatar">
            E
        </div>

        <div class="message-content">

            <div class="message-name">
                You
            </div>

            <div class="message-text">
                ${escapeHtml(message)}
            </div>

        </div>
    `;

    chatMessages.appendChild(messageElement);

    scrollToBottom();
}


// ==========================================
// ADD JARVIS MESSAGE
// ==========================================

function addJarvisMessage(message) {

    const messageElement = document.createElement("div");

    messageElement.className = "message jarvis-message";

    messageElement.innerHTML = `
        <div class="avatar">
            J
        </div>

        <div class="message-content">

            <div class="message-name">
                Jarvis
            </div>

            <div class="message-text">
                ${escapeHtml(message)}
            </div>

        </div>
    `;

    chatMessages.appendChild(messageElement);

    scrollToBottom();
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ==========================================
// SCROLL CHAT
// ==========================================

function scrollToBottom() {

    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// ==========================================
// TYPING INDICATOR
// ==========================================

function showTypingIndicator() {

    const typing = document.createElement("div");

    typing.id = "typingIndicator";

    typing.className = "message jarvis-message";

    typing.innerHTML = `
        <div class="avatar">
            J
        </div>

        <div class="message-content">

            <div class="message-name">
                Jarvis
            </div>

            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>

        </div>
    `;

    chatMessages.appendChild(typing);

    scrollToBottom();
}


// ==========================================
// REMOVE TYPING INDICATOR
// ==========================================

function removeTypingIndicator() {

    const typing = document.getElementById("typingIndicator");

    if (typing) {
        typing.remove();
    }
}


// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message) {
        return;
    }


    // Add user message
    addUserMessage(message);


    // Clear input
    messageInput.value = "";


    // Disable button
    sendButton.disabled = true;

    sendButton.textContent = "Thinking...";


    // Show typing
    showTypingIndicator();


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });


        // Check HTTP status
        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const data = await response.json();


        removeTypingIndicator();


        const answer =
            data.response ||
            "Sorry, I didn't receive a response.";


        // Display response
        addJarvisMessage(answer);


        // Speak response
        speakText(answer);


    } catch (error) {

        console.error("Chat Error:", error);

        removeTypingIndicator();

        addJarvisMessage(
            "Sorry Eklavya, I could not connect to the AI service."
        );

    } finally {

        sendButton.disabled = false;

        sendButton.textContent = "Send";

        messageInput.focus();

    }
}


// ==========================================
// ENTER KEY
// ==========================================

messageInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();

        }

    }
);


// ==========================================
// SEND BUTTON
// ==========================================

sendButton.addEventListener(
    "click",
    sendMessage
);


// ==========================================
// TEXT TO SPEECH
// ==========================================

function speakText(text) {

    if (!("speechSynthesis" in window)) {

        console.warn(
            "Speech synthesis is not supported."
        );

        return;
    }


    // Stop previous speech
    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(text);


    utterance.lang = "en-IN";

    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.volume = 1;


    window.speechSynthesis.speak(utterance);
}


// ==========================================
// SPEECH RECOGNITION
// ==========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition = new SpeechRecognition();


    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.lang = "en-IN";


    // ------------------------------
    // Speech started
    // ------------------------------

    recognition.onstart = function() {

        isListening = true;

        micButton.classList.add("listening");

        listeningStatus.textContent =
            "Listening... Speak now";

    };


    // ------------------------------
    // Speech result
    // ------------------------------

    recognition.onresult = function(event) {

        const transcript =
            event.results[0][0].transcript;


        console.log(
            "Recognized speech:",
            transcript
        );


        messageInput.value = transcript;

        listeningStatus.textContent =
            "Speech recognized";


        // Automatically send
        sendMessage();

    };


    // ------------------------------
    // Speech error
    // ------------------------------

    recognition.onerror = function(event) {

        console.error(
            "Speech recognition error:",
            event.error
        );


        isListening = false;

        micButton.classList.remove("listening");


        if (event.error === "not-allowed") {

            listeningStatus.textContent =
                "Microphone permission denied";

        } else if (event.error === "no-speech") {

            listeningStatus.textContent =
                "No speech detected. Try again.";

        } else {

            listeningStatus.textContent =
                "Could not understand. Try again.";

        }

    };


    // ------------------------------
    // Speech ended
    // ------------------------------

    recognition.onend = function() {

        isListening = false;

        micButton.classList.remove("listening");


        if (
            listeningStatus.textContent ===
            "Listening... Speak now"
        ) {

            listeningStatus.textContent =
                "Click the microphone to speak";

        }

    };


} else {

    console.warn(
        "Speech Recognition is not supported in this browser."
    );


    micButton.disabled = true;

    listeningStatus.textContent =
        "Speech recognition is not supported in this browser.";

}


// ==========================================
// MICROPHONE BUTTON
// ==========================================

micButton.addEventListener(
    "click",
    function() {

        if (!recognition) {

            alert(
                "Speech recognition is not supported. Please use Google Chrome or Microsoft Edge."
            );

            return;
        }


        if (isListening) {

            recognition.stop();

            return;

        }


        try {

            recognition.start();

        } catch (error) {

            console.error(
                "Microphone error:",
                error
            );

        }

    }
);


// ==========================================
// LOAD SPEECH VOICES
// ==========================================

if ("speechSynthesis" in window) {

    window.speechSynthesis.onvoiceschanged =
        function() {

            const voices =
                window.speechSynthesis.getVoices();

            console.log(
                "Available voices:",
                voices.length
            );

        };

}


// ==========================================
// INITIAL FOCUS
// ==========================================

window.addEventListener(
    "load",
    function() {

        messageInput.focus();

        console.log(
            "Jarvis frontend loaded successfully."
        );

        console.log(
            "API:",
            API_URL
        );

    }
);