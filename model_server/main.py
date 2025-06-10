from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle


app = FastAPI()

app.add_middleware(
      CORSMiddleware,
      allow_origins = ["*"],
      allow_credentials = True,
      allow_methods = ["*"],
      allow_headers = ["*"],
)

vectorizer = pickle.load(open("models/vectorizerForSentenceChecker.pkl","rb"))
classifier = pickle.load(open("models/sentenceCheckingModel.pkl","rb"))

class SentenceRequest(BaseModel):
      sentence:str 

@app.post("/validate")
def validate_sentence(request:SentenceRequest):
      print(request)
      x = vectorizer.transform([request.sentence])
      y = classifier.predict(x)[0]
      print(f"response: {y}")
      return True if y == 'valid' else False

@app.post("/convert")
def convert_sentence():
      print("welcome")