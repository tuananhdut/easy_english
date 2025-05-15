import pyttsx3

engine = pyttsx3.init()
engine.save_to_file("public", '../temp/output.mp3')
engine.runAndWait()
