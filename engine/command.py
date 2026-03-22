import speech_recognition as sr
import eel
import time
import threading
from engine.config import ASSISTANT_NAME
from engine.features import speak 

def takecommand():
    """
    Captures audio from the microphone.
    """
    r = sr.Recognizer()
    with sr.Microphone() as source:
        try:
            print('listening....')
            eel.DisplayMessage('Listening....')
            eel.updateAmplitude(0.6) 
            
            r.pause_threshold = 1
            r.adjust_for_ambient_noise(source, duration=1)
            audio = r.listen(source, timeout=10, phrase_time_limit=6)
            
            eel.updateAmplitude(0.2) 
            print("Audio captured. Recognizing...")
            eel.DisplayMessage('Recognizing....')
            
            query = r.recognize_google(audio, language='en-in')
            print(f"User said: {query}")
            return query

        except sr.WaitTimeoutError:
            eel.onError({"status": "error", "message": "No speech detected."})
            return "ERROR_TIMEOUT"
        except sr.UnknownValueError:
            eel.onError({"status": "error", "message": "Could not understand audio."})
            return "ERROR_RECOGNITION"
        except Exception as e:
            eel.onError({"status": "error", "message": str(e)})
            return "ERROR_MIC"

@eel.expose
def allCommands(message=1):
    """
    Main Entry Point.
    FIX: We use native threading here instead of eel.spawn for true non-blocking performance.
    """
    t = threading.Thread(target=process_logic, args=(message,))
    t.start()

def process_logic(message):
    """
    Handles the AI logic in a separate thread.
    """
    try:
        # 1. Determine input source (Mic vs Textbox)
        query = takecommand() if message == 1 else message

        # 2. Proceed only if the query is valid
        if query and str(query).strip() != "" and not str(query).startswith("ERROR_"):
            eel.senderText(query)
            qlower = str(query).lower()

            # Logic Routing
            if any(phrase in qlower for phrase in ("who are you", "tell me about yourself", "who made you")):
                response = f"I am {ASSISTANT_NAME}, an AI agent created by Anannay Varshney."
                eel.receiverText(response)
                speak(response)
            
            elif "open" in qlower:
                from engine.features import openCommand
                openCommand(query)
            
            else:
                # LLM Processing
                from engine.features import chatBot
                chatBot(query)
        
        else:
            print("Process Logic: No valid query to process.")

    except Exception as e:
        print(f"Internal Logic Error: {e}")
        eel.onError({"status": "error", "message": "Assistant logic encountered an error."})
    
    finally:
        # Unlock UI after thread finishes
        print("Command cycle complete. Unlocking UI.")
        eel.ShowHood()