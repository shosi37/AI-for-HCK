# Quick Start: Setting Up Google Forms Survey

## Step 1: Create the Form (2 minutes)

1. Go to https://forms.google.com
2. Click **"+ Create new form"**
3. Name: **"Herald College Chatbot Feedback"**
4. Add description: **"Help us improve our AI assistant"**

---

## Step 2: Add Questions (10 minutes)

Copy-paste these questions into Google Forms:

### Q1: Overall Rating
- Question: "How would you rate your overall experience with the chatbot?"
- Type: Linear Scale (1-5)
- Labels: "Very Poor" → "Excellent"
- Required: Yes ✓

### Q2: Ease of Use
- Question: "How easy was it to use the chatbot?"
- Type: Linear Scale (1-5)
- Labels: "Very Difficult" → "Very Easy"
- Required: Yes ✓

### Q3: Understanding
- Question: "Did the chatbot understand your question correctly?"
- Type: Multiple Choice
- Options: Yes, completely | Partially | No
- Required: Yes ✓

### Q4: Intent Topics (Multi-select)
- Question: "Which topics did you ask about?"
- Type: Checkboxes
- Options:
  - Programs/Courses
  - Admission Requirements
  - Application Deadline
  - Tuition Fees
  - Job Placement
  - Location
  - Contact Information
  - Other

### Q5: Relevance
- Question: "Was the response relevant to your question?"
- Type: Multiple Choice
- Options: Very Relevant | Relevant | Somewhat | Not Relevant
- Required: Yes ✓

### Q6: Accuracy
- Question: "Did the chatbot provide accurate information?"
- Type: Multiple Choice
- Options: Very Accurate | Mostly | Partially | Inaccurate
- Required: Yes ✓

### Q7: Clarity
- Question: "How clear was the response?"
- Type: Linear Scale (1-5)
- Labels: "Very Unclear" → "Very Clear"
- Required: Yes ✓

### Q8: Completeness
- Question: "Was the response complete?"
- Type: Multiple Choice
- Options: Complete | Mostly Complete | Missing Details | Incomplete
- Required: Yes ✓

### Q9: Response Speed
- Question: "How long did it take to get a response?"
- Type: Multiple Choice
- Options: Instant (<1s) | Fast (1-2s) | Acceptable (2-5s) | Slow (>5s)
- Required: Yes ✓

### Q10: Job Placement Question
- Question: "Have you asked about Job Placement?"
- Type: Multiple Choice
- Options: Yes | No
- (If Yes → Show Q11)

### Q11: Job Placement Rating
- Question: "Rate the accuracy of the job placement response:"
- Type: Linear Scale (1-5)
- Conditional: Show only if Q10 = Yes

### Q12: Recommendation
- Question: "Would you recommend this chatbot?"
- Type: Multiple Choice
- Options: Definitely Yes | Probably Yes | Not Sure | Probably Not | Definitely Not
- Required: Yes ✓

### Q13: Improvement Areas
- Question: "What should we improve?"
- Type: Checkboxes
- Options:
  - More detailed info
  - Better clarity
  - Faster responses
  - More programs
  - Scholarships
  - Job placement details
  - Campus facilities
  - Other

### Q14: Comments
- Question: "Any additional feedback?"
- Type: Paragraph (Long Answer)
- Required: No

### Q15: Contact (Optional)
- Question: "Email address (optional):"
- Type: Short Answer
- Required: No

---

## Step 3: Customize Appearance (5 minutes)

1. Click **"Customize theme"** (palette icon)
2. Choose colors matching college branding
3. Add header image: Upload Herald College logo
4. Select professional font

---

## Step 4: Share Survey (Immediate)

### Option A: Get Shareable Link
1. Click **"Send"** (top-right)
2. Click **"Link"** icon
3. Copy the URL
4. Share everywhere!

### Option B: Embed on Website
1. Click **"Send"**
2. Click **"</>"** icon
3. Copy embed code
4. Paste in chatbot webpage

### Option C: Share via Email
1. Click **"Send"**
2. Enter email addresses
3. Click **"Send"**

### Option D: QR Code
1. Click **"Send"**
2. Click **"QR Code"** icon
3. Download & print for admissions office

---

## Step 5: Collect & Analyze Responses

### Monitor Responses:
1. Click **"Responses"** tab
2. See real-time responses
3. View summary charts

### Export Data:
1. Click **"..."** (three dots)
2. Select **"Download responses (CSV)"**
3. Open in Excel/Google Sheets

### Key Metrics to Watch:
- Average rating (target: 4.5/5)
- % "Yes" for recommendation (target: 80%+)
- Common issues in comments
- Performance by intent

---

## Sample Survey Link Format

```
https://forms.gle/XXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Response Target Goals

| Metric | Target |
|--------|--------|
| Responses | 100+ |
| Avg Rating | 4.5/5 |
| Understanding Rate | 95%+ |
| Recommendation Rate | 80%+ |
| Completion Time | 2-3 min |

---

## Analysis Dashboard (Google Sheets)

After collecting 50+ responses, create a dashboard:

1. Download responses as CSV
2. Import to Google Sheets
3. Create pivot tables for:
   - Intent accuracy by topic
   - Rating distribution
   - Common improvement requests
   - NPS Score calculation

---

## NPS Score Calculation

From Q12 answers:
- **Promoters** (Definitely/Probably Yes): Calculate %
- **Detractors** (Probably/Definitely Not): Calculate %
- **NPS = (Promoters % - Detractors %) × 100**
- Target: NPS > 50

---

## Troubleshooting

**Issue**: Survey not getting responses
- Solution: Add direct link to chatbot UI
- Solution: Share QR code in multiple places
- Solution: Send reminder emails

**Issue**: Responses show low ratings
- Solution: Train on low-performing intents
- Solution: Add more example data
- Solution: Improve response quality

**Issue**: Specific intent rated poorly
- Action: Focus training on that intent
- Action: Add more utterances
- Action: Review response quality

---

## Next Steps After Survey

### Week 1: Collect 50+ responses
### Week 2: Analyze results
### Week 3: Implement improvements based on feedback
### Week 4: Re-run survey to validate improvements

---

## Direct Link to Create Form

👉 **Start here**: https://forms.google.com/create

Then follow the questions above!

