import speech_recognition as sr
import os
import webbrowser
import datetime
import pyttsx3
from openai import OpenAI
from dotenv import load_dotenv


# -----------------------------
# Load Environment Variables
# -----------------------------
load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)


# -----------------------------
# Text-to-Speech
# -----------------------------
engine = pyttsx3.init()
engine.setProperty("rate", 170)


def say(text):
    print("Jarvis:", text)
    engine.say(text)
    engine.runAndWait()


# -----------------------------
# OpenRouter AI
# -----------------------------
def chat(query):
    try:
        response = client.chat.completions.create(
            model="openrouter/free",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Jarvis, a helpful personal voice assistant. "
                        "The user's name is Eklavya. "
                        "Address the user as Eklavya when appropriate. "
                        "Answer naturally and concisely. "
                        "Do not prefix your answers with 'Jarvis:'."
                    )
                },
                {
                    "role": "user",
                    "content": query
                }
            ]
        )

        answer = response.choices[0].message.content.strip()

        say(answer)

        return answer

    except Exception as e:
        print("OpenRouter Error:", e)
        say(
            "Sorry Eklavya, I could not connect to the AI service."
        )
        return ""


# -----------------------------
# Speech Recognition
# -----------------------------
def takeCommand():
    recognizer = sr.Recognizer()

    try:
        with sr.Microphone() as source:

            print("Listening...")

            recognizer.adjust_for_ambient_noise(
                source,
                duration=0.5
            )

            audio = recognizer.listen(
                source,
                timeout=5,
                phrase_time_limit=10
            )

        print("Recognizing...")

        query = recognizer.recognize_google(
            audio,
            language="en-IN"
        )

        print("You:", query)

        return query.lower().strip()

    except sr.WaitTimeoutError:
        print("No speech detected.")
        return ""

    except sr.UnknownValueError:
        print("Could not understand.")
        return ""

    except sr.RequestError:
        print("Speech recognition service unavailable.")
        return ""

    except Exception as e:
        print("Microphone Error:", e)
        return ""


# -----------------------------
# Open Website
# -----------------------------
def open_website(name, url):
    say(f"Opening {name}.")
    webbrowser.open(url)


# -----------------------------
# Main
# -----------------------------
if __name__ == "__main__":

    print("==============================")
    print("       Welcome to Jarvis A.I")
    print("==============================")

    say("Jarvis A.I is online. Hello Eklavya.")

    while True:

        query = takeCommand()

        if not query:
            continue

        # -----------------------------
        # Open YouTube
        # -----------------------------
        if "open youtube" in query:
            open_website(
                "YouTube",
                "https://www.youtube.com"
            )

        # -----------------------------
        # Open Google
        # -----------------------------
        elif "open google" in query:
            open_website(
                "Google",
                "https://www.google.com"
            )

        # -----------------------------
        # Open Wikipedia
        # -----------------------------
        elif "open wikipedia" in query:
            open_website(
                "Wikipedia",
                "https://www.wikipedia.org"
            )

        # -----------------------------
        # Open GitHub
        # -----------------------------
        elif "open github" in query:
            open_website(
                "GitHub",
                "https://github.com"
            )

        # -----------------------------
        # Open LinkedIn
        # -----------------------------
        elif "open linkedin" in query:
            open_website(
                "LinkedIn",
                "https://www.linkedin.com"
            )

        # -----------------------------
        # Tell Time
        # -----------------------------
        elif (
            "what is the time" in query
            or "the time" in query
        ):

            current_time = datetime.datetime.now().strftime(
                "%I:%M %p"
            )

            say(
                f"Eklavya, the current time is {current_time}."
            )

        # -----------------------------
        # Quit Jarvis
        # -----------------------------
        elif (
            "jarvis quit" in query
            or "quit jarvis" in query
            or "stop jarvis" in query
            or "exit jarvis" in query
        ):

            say("Goodbye Eklavya.")
            break

        # -----------------------------
        # Normal Conversation
        # -----------------------------
        else:

            print("Chatting...")
            chat(query)