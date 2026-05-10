import json
import requests
from rasa_sdk import Action
from rasa_sdk.executor import CollectingDispatcher

API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-base"
headers = {"Authorization": "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"}

with open("knowledge_base.json") as f:
    college_data = json.load(f)

class ActionAIResponse(Action):


    def name(self):
        return "action_ai_response"

    def run(self, dispatcher, tracker, domain):
        intent = tracker.latest_message.get("intent", {}).get("name")
        user_message = tracker.latest_message.get("text")

        # Explicitly handle greetings and goodbyes
        if intent == "greet":
            dispatcher.utter_message(response="utter_greet")
            return []
        elif intent == "goodbye":
            dispatcher.utter_message(response="utter_goodbye")
            return []
        
        # If the intent is already identified as fallback (nonsense/random), skip the AI call
        if intent == "nlu_fallback" or len(user_message.strip()) < 3:
            dispatcher.utter_message(text="Sorry, I didn't understand that. Could you please ask something related to Herald College Kathmandu?")
            return []

        # Better prompt for the AI to handle unrelated or gibberish text
        context = f"""
        You are an AI assistant for Herald College Kathmandu. 
        Your goal is to answer questions based ONLY on the provided knowledge base.
        
        Rules:
        1. If the question is gibberish, nonsense, or unrelated to Herald College, respond with: "Sorry, I didn't understand that. Could you please ask something related to Herald College Kathmandu?"
        2. Be concise and professional.
        
        Knowledge Base:
        {college_data}

        Student Question: {user_message}
        Answer:
        """

        payload = {"inputs": context}


        try:
            response = requests.post(API_URL, headers=headers, json=payload, timeout=10)
            result = response.json()
            if isinstance(result, list):
                answer = result[0].get("generated_text", "Sorry, I couldn't process your request.")
            else:
                answer = "Sorry, I couldn't process your request."
        except Exception:
            answer = "Sorry, there was an error processing your request."

        dispatcher.utter_message(text=answer)
        return []