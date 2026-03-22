import pyttsx3
import eel
from engine.config import ASSISTANT_NAME
import os
import sqlite3
import webbrowser
from hugchat import hugchat
import string
import time
import re

# Global engine variable to allow stopping
engine = None

# ChatBot Session Setup
chatbot = None
try:
    chatbot = hugchat.ChatBot(cookie_path="engine/huggingface_cookies.json")
    current_conversation_id = chatbot.new_conversation()
    chatbot.change_conversation(current_conversation_id)
    print("Prajñāvan AI Engine: Ready")
except Exception as e:
    print(f"ChatBot Initialization Error: {e}")

# Database Connection
con = sqlite3.connect('Prajñāvan.db', check_same_thread=False)
cursor = con.cursor()

@eel.expose
def stop_speech():
    """Stops the current speech playback immediately."""
    global engine
    print("User requested to stop speech.")
    
    # Force the engine to stop if it's running
    if engine is not None:
        try:
            engine.stop()
        except Exception as e:
            print(f"Error stopping engine: {e}")

@eel.expose
def speak(text):
    global engine
    text = str(text)
    
    # 1. Clean Text for Display
    eel.DisplayMessage(text)
    eel.receiverText(text)
    eel.updateAmplitude(1)

    # 2. Clean Text for Audio
    clean_text = re.sub(r'[^\w\s,!.?]', '', text)

    # 3. Initialize Engine (Global instance)
    engine = pyttsx3.init('sapi5')
    voices = engine.getProperty('voices')
    engine.setProperty('voice', voices[1].id)
    engine.setProperty('rate', 174)

    # 4. SHOW STOP BUTTON (Only now, when speaking starts)
    eel.showStopButton()

    # 5. Speak
    try:
        engine.say(clean_text)
        engine.runAndWait()
    except Exception as e:
        print(f"Speech interrupted or error: {e}")
    
    # 6. Cleanup
    eel.hideStopButton() # Hide button when done
    eel.updateAmplitude(0)
    engine = None # Reset engine

@eel.expose
def playAssistantSound():
    from playsound import playsound
    music_dir = os.path.join("www", "assets", "audio", "AV starting_audio.mp3")
    if os.path.exists(music_dir):
        playsound(music_dir)

def openCommand(query):
    query = query.replace(ASSISTANT_NAME, "").replace("open", "").lower().strip()
    if query != "":
        try:
            cursor.execute('SELECT path FROM sys_command WHERE name = ?', (query,))
            results = cursor.fetchall()
            if results:
                speak(f"Opening {query}")
                os.startfile(results[0][0])
            else:
                cursor.execute('SELECT url FROM web_command WHERE name = ?', (query,))
                results = cursor.fetchall()
                if results:
                    speak(f"Opening {query}")
                    webbrowser.open(results[0][0])
                else:
                    speak(f"Opening {query}")
                    os.system(f'start {query}')
        except Exception:
            speak("I encountered an error trying to open that application.")

def chatBot(query):
    if chatbot is None:
        speak("I'm sorry, my brain is currently offline.")
        return

    try:
        cursor.execute("INSERT INTO chat_history (sender, message) VALUES (?, ?)", ("User", query))
        con.commit()

        cursor.execute("SELECT sender, message FROM chat_history ORDER BY id DESC LIMIT 5")
        history = cursor.fetchall()[::-1] 
        context_string = "\n".join([f"{h[0]}: {h[1]}" for h in history])
        full_prompt = f"Context:\n{context_string}\n\nUser: {query}"

        api_response = chatbot.chat(full_prompt)
        response_text = str(api_response)

        cursor.execute("INSERT INTO chat_history (sender, message) VALUES (?, ?)", ("Assistant", response_text))
        con.commit()

        print(f"Prajñāvan: {response_text}")
        speak(response_text)
        return response_text

    except Exception as e:
        print(f"Chat Error: {e}")
        speak("I encountered a problem while thinking.")
        return None