import os
import eel
import webbrowser
from engine.features import *
from engine.command import *

def start():
    # Initialize the web directory
    eel.init("www")

    # Start the assistant audio
    playAssistantSound()

    # Launch in the system's default browser instead of hardcoded Edge
    # 'new=2' opens in a new tab if a window is already open
    url = "http://localhost:8000/index.html"
    webbrowser.open(url, new=2)

    # Start the Eel server
    try:
        eel.start("index.html", mode=None, host='localhost', block=True)
    except (SystemExit, KeyboardInterrupt):
        print("Prajñāvan AI is going to shutting down...")

if __name__ == '__main__':
    start()
