# Postman Integration Tests for Chatbot API

## Base URL
```
http://localhost:5000
```

## 1. Send Message / Chat Endpoint

### Request
```
POST /chat
Content-Type: application/json

{
  "message": "What programs do you offer?",
  "sender": "user123"
}
```

### Response (200 OK)
```json
{
  "recipient_id": "user123",
  "text": "We offer BSc (Hons) Computer Science and BBA (Hons) International Business Management. Both are full-time undergraduate programs. If you need details about each, just ask!",
  "intent": "ask_programs",
  "confidence": 0.9987,
  "timestamp": "2026-05-26T03:30:00Z"
}
```

---

## 2. Greet Intent

### Request
```
POST /chat
Content-Type: application/json

{
  "message": "Hello",
  "sender": "user456"
}
```

### Response (200 OK)
```json
{
  "recipient_id": "user456",
  "text": "Hello! How can I help you with your college inquiries?",
  "intent": "greet",
  "confidence": 1.0,
  "timestamp": "2026-05-26T03:31:00Z"
}
```

---

## 3. Ask Admission Requirements

### Request
```
POST /chat
Content-Type: application/json

{
  "message": "What are the admission requirements?",
  "sender": "user789"
}
```

### Response (200 OK)
```json
{
  "recipient_id": "user789",
  "text": "Admission requirements include completion of higher secondary education (+2/A-levels) or equivalent, with a minimum of 45%. English proficiency is required. Please check our website or contact admissions for details.",
  "intent": "ask_admission_requirements",
  "confidence": 0.9964,
  "timestamp": "2026-05-26T03:32:00Z"
}
```

---

## 4. Ask Location

### Request
```
POST /chat
Content-Type: application/json

{
  "message": "Where is the college located?",
  "sender": "user101"
}
```

### Response (200 OK)
```json
{
  "recipient_id": "user101",
  "text": "The college is located in Naxal, Kathmandu.",
  "intent": "ask_location",
  "confidence": 0.9998,
  "timestamp": "2026-05-26T03:33:00Z"
}
```

---

## 5. Ask Application Deadline

### Request
```
POST /chat
Content-Type: application/json

{
  "message": "When is the application deadline?",
  "sender": "user202"
}
```

### Response (200 OK)
```json
{
  "recipient_id": "user202",
  "text": "The application deadline is typically a few weeks before the semester starts. Please check our website for the latest dates.",
  "intent": "ask_application_deadline",
  "confidence": 0.9956,
  "timestamp": "2026-05-26T03:34:00Z"
}
```

---

## 6. Ask Tuition Fees

### Request
```
POST /chat
Content-Type: application/json

{
  "message": "What are the tuition fees for Computer Science?",
  "sender": "user303"
}
```

### Response (200 OK)
```json
{
  "recipient_id": "user303",
  "text": "The tuition fees for BSc Computer Science are NPR 4,50,000 per year. Payment plans and scholarships are available. For details, contact the finance office.",
  "intent": "ask_tuition_fees_cs",
  "confidence": 0.987,
  "timestamp": "2026-05-26T03:35:00Z"
}
```

---

## 7. Ask Job Placement (Below 85% Confidence)

### Request
```
POST /chat
Content-Type: application/json

{
  "message": "Tell me about job placement rates",
  "sender": "user404"
}
```

### Response (200 OK - Note: Lower Confidence)
```json
{
  "recipient_id": "user404",
  "text": "Our graduates have strong placement records with companies in the IT and business sectors. For specific statistics, please contact the placement office.",
  "intent": "ask_job_placement",
  "confidence": 0.77,
  "timestamp": "2026-05-26T03:36:00Z"
}
```

---

## 8. Fallback Intent (Unknown Query)

### Request
```
POST /chat
Content-Type: application/json

{
  "message": "Can you tell me a joke about programming?",
  "sender": "user505"
}
```

### Response (200 OK - Fallback)
```json
{
  "recipient_id": "user505",
  "text": "Sorry, I didn't understand that. Could you please ask something related to Herald College Kathmandu?",
  "intent": "nlu_fallback",
  "confidence": 0.0,
  "timestamp": "2026-05-26T03:37:00Z"
}
```

---

## 9. Goodbye Intent

### Request
```
POST /chat
Content-Type: application/json

{
  "message": "Goodbye!",
  "sender": "user606"
}
```

### Response (200 OK)
```json
{
  "recipient_id": "user606",
  "text": "Goodbye! If you have more questions, feel free to ask.",
  "intent": "goodbye",
  "confidence": 1.0,
  "timestamp": "2026-05-26T03:38:00Z"
}
```

---

## 10. Error Response - Missing Required Field

### Request
```
POST /chat
Content-Type: application/json

{
  "sender": "user707"
}
```

### Response (400 Bad Request)
```json
{
  "error": "Missing required field: message",
  "status": 400,
  "timestamp": "2026-05-26T03:39:00Z"
}
```

---

## 11. Intent Prediction Endpoint (If Available)

### Request
```
POST /predict
Content-Type: application/json

{
  "text": "What courses do you offer?"
}
```

### Response (200 OK)
```json
{
  "intent": "ask_programs",
  "confidence": 0.9987,
  "entities": [],
  "text": "What courses do you offer?",
  "timestamp": "2026-05-26T03:40:00Z"
}
```

---

## 12. Session/User History Endpoint (If Available)

### Request
```
GET /session/user123
Content-Type: application/json
```

### Response (200 OK)
```json
{
  "user_id": "user123",
  "messages": [
    {
      "user_message": "What programs do you offer?",
      "bot_response": "We offer BSc (Hons) Computer Science and BBA (Hons) International Business Management...",
      "intent": "ask_programs",
      "timestamp": "2026-05-26T03:30:00Z"
    },
    {
      "user_message": "What are the fees?",
      "bot_response": "The tuition fees for BSc Computer Science are NPR 4,50,000 per year...",
      "intent": "ask_tuition_fees_cs",
      "timestamp": "2026-05-26T03:31:00Z"
    }
  ],
  "session_start": "2026-05-26T03:25:00Z",
  "session_end": "2026-05-26T03:35:00Z"
}
```

---

## Testing Checklist

- [ ] Test high-confidence intents (> 0.95)
- [ ] Test low-confidence intents (0.77 - 0.85)
- [ ] Test fallback intent (nlu_fallback)
- [ ] Test with missing fields
- [ ] Test with special characters
- [ ] Test multiple messages in sequence
- [ ] Test response time (< 2 seconds expected)
- [ ] Test error handling
- [ ] Test session persistence
- [ ] Verify intent accuracy matches intent_report.json (98.6%)

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Overall Accuracy | 98.65% |
| Intents with 100% F1-score | 28 |
| Intents below 85% F1-score | 1 (nlu_fallback) |
| Average Response Time | ~500ms |
| Total Test Samples | 443 |

---

## Notes

1. **High Confidence Intents**: Most intents have near-perfect confidence (0.98-1.0)
2. **Low Confidence Intent**: `ask_job_placement` and `ask_tuition_fees_ibm` have F1-score of 0.87 (slightly below 85% threshold)
3. **Fallback Handling**: The `nlu_fallback` intent has 0% precision/recall, meaning it needs training data improvement
4. **Response Format**: All responses include timestamp, intent, and confidence for traceability
5. **Error Handling**: Graceful error messages for malformed requests

