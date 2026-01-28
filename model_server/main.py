from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import requests
import os
from dotenv import load_dotenv


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
class sentence(BaseModel):
      sentence:str


@app.get("/")
def read_root():
      return {"message": "Welcome to the Sentence Validation and Conversion API"}

@app.post("/validate")
def validate_sentence(request:SentenceRequest):
      print(request)
      x = vectorizer.transform([request.sentence])
      y = classifier.predict(x)[0]
      print(f"response: {y}")
      return True if y == 'valid' else False

@app.post("/convert",status_code=200)
def convert_sentence(request:sentence):
      sentence = [request.sentence] or "I bought groceries for $50 on 2023-10-01"
      data = {}
      data["model"] = "liquid/lfm-2.5-1.2b-thinking:free"
      data["messages"] = [
            {
                  "role": "user",
                  "content": f"Convert the following sentense to the JSON format '{sentence}'. the format is {{ type: 'income'/'expense',category( Income,Groceries and Utilities,Transportation,Medical & Healthcare,Food and drinks,other),amount,date(the default date should be the current date),note(it is a short description of the transaction and is important )}}  Only give the Json response no additional stuff"
            }
      ]
      load_dotenv()
      api_key = os.getenv("OPENROUTER_API_KEY")
      print(f"api_key: {api_key}")
      headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
      }
      response = requests.post("https://openrouter.ai/api/v1/chat/completions", json=data, headers=headers)
      if response.status_code != 200:
            print(f"Error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=400, detail="Failed to convert sentence")
            # return {"error": "Failed to convert sentence"}
      print( response.json().get("choices")[0].get("message").get("content"))
      return response.json().get("choices")[0].get("message").get("content")
