# Google Forms Survey - Herald College Chatbot Feedback

## Survey Overview
This survey collects user feedback on the AI chatbot system to improve intent recognition, response quality, and overall user experience.

---

## Survey Link
```
https://forms.gle/YourSurveyCode
```

---

## Survey Questions

### Section 1: General Experience

**Question 1: How would you rate your overall experience with the chatbot?**
- Scale: 1 (Very Poor) to 5 (Excellent)
- Required: Yes

**Question 2: How easy was it to use the chatbot?**
- Scale: 1 (Very Difficult) to 5 (Very Easy)
- Required: Yes

**Question 3: Did the chatbot understand your question correctly?**
- Options:
  - Yes, completely
  - Partially
  - No, not at all
- Required: Yes

---

### Section 2: Intent Recognition Accuracy

**Question 4: Which of the following intents did you ask the chatbot about? (Select all that apply)**
- Checkboxes:
  - Programs/Courses
  - Admission Requirements
  - Application Deadline
  - Tuition Fees
  - Job Placement
  - Location
  - Contact Information
  - Facilities
  - Other: ___________
- Required: No

**Question 5: Was the chatbot's response relevant to your question?**
- Options:
  - Very relevant
  - Relevant
  - Somewhat relevant
  - Not relevant
- Required: Yes

**Question 6: Did the chatbot provide accurate information?**
- Options:
  - Yes, very accurate
  - Mostly accurate
  - Partially accurate
  - Inaccurate
- Required: Yes

---

### Section 3: Response Quality

**Question 7: How clear was the chatbot's response?**
- Scale: 1 (Very Unclear) to 5 (Very Clear)
- Required: Yes

**Question 8: Was the response complete, or did it need more details?**
- Options:
  - Complete and sufficient
  - Mostly complete
  - Missing some details
  - Severely incomplete
- Required: Yes

**Question 9: How long did it take to get a response?**
- Options:
  - Instant (< 1 second)
  - Fast (1-2 seconds)
  - Acceptable (2-5 seconds)
  - Slow (> 5 seconds)
- Required: Yes

---

### Section 4: Problem Intents (Below 85%)

**Question 10: Have you asked about Job Placement information?**
- Options:
  - Yes
  - No
- Required: No
- Conditional: If Yes, show Question 11

**Question 11: Rate the accuracy of the job placement response:**
- Scale: 1 (Very Inaccurate) to 5 (Very Accurate)
- Required: Conditional

**Question 12: Have you asked about Tuition Fees (IBM program)?**
- Options:
  - Yes
  - No
- Required: No

---

### Section 5: Areas for Improvement

**Question 13: What topics should the chatbot improve on?**
- Checkboxes:
  - More detailed information
  - Better clarity
  - Faster responses
  - More program options
  - Scholarship information
  - Placement details
  - Campus facilities
  - Other: ___________
- Required: No

**Question 14: Did the chatbot refuse to answer any of your questions?**
- Options:
  - Yes
  - No
  - Not sure
- Required: No

**Question 15: If yes to question 14, what question did the chatbot not understand?**
- Text field
- Required: Conditional (if Yes selected)

---

### Section 6: Comparative Feedback

**Question 16: How does this chatbot compare to other college chatbots you've used?**
- Options:
  - Much better
  - Better
  - About the same
  - Worse
  - Much worse
  - Never used another
- Required: No

**Question 17: Would you recommend this chatbot to other prospective students?**
- Options:
  - Definitely yes
  - Probably yes
  - Not sure
  - Probably not
  - Definitely not
- Required: Yes

---

### Section 7: Demographic & Additional Feedback

**Question 18: What is your primary reason for using the chatbot?**
- Options:
  - General college information
  - Admission inquiries
  - Course information
  - Fee information
  - Campus facilities
  - Other: ___________
- Required: No

**Question 19: Are you a prospective student?**
- Options:
  - Yes
  - Current student
  - Alumni
  - Other
- Required: No

**Question 20: Any additional comments or suggestions for improvement?**
- Text field (Long answer)
- Required: No

---

## Survey Setup Instructions

### Creating the Survey in Google Forms:

1. **Go to Google Forms**
   - Visit: https://forms.google.com
   - Click "Create new form"

2. **Set Title and Description**
   - Title: "Herald College Chatbot Feedback Survey"
   - Description: "Help us improve! Share your experience with our AI chatbot"

3. **Add Questions**
   - Copy each question from above
   - Select appropriate question type (Multiple choice, Scale, Checkbox, etc.)
   - Mark required questions with asterisk (*)

4. **Customize Form**
   - Add header image (Herald College logo)
   - Choose theme color (College brand colors)
   - Enable "Collect email addresses" (Optional - to track respondents)

5. **Share Survey**
   - Click "Send" (top-right)
   - Copy link and share with users
   - Post on chatbot interface
   - Share via social media
   - Email to prospective students

---

## Survey Analytics Template

### Key Metrics to Track:

| Metric | Target | Current |
|--------|--------|---------|
| Average Overall Rating | 4.5/5 | - |
| Ease of Use Rating | 4.3/5 | - |
| Understanding Rate | 95% | - |
| Information Accuracy | 90% | - |
| Response Clarity | 4.2/5 | - |
| Recommendation Rate | 80% | - |

---

## Response Analysis Checklist

After collecting responses, analyze:

- [ ] **Intent Recognition**: % of users saying chatbot understood questions correctly
- [ ] **Problem Areas**: Which intents had low accuracy scores?
- [ ] **Improvement Requests**: Common themes in feedback
- [ ] **High Performers**: Best-performing intents (greet, ask_programs, etc.)
- [ ] **Low Performers**: Focus on improving job_placement, tuition_fees_ibm
- [ ] **Satisfaction Score**: Overall NPS (Net Promoter Score)
- [ ] **Usability**: Scale 1-5 ease of use ratings
- [ ] **Recommendation**: % who would recommend to others

---

## Sample Response Data Expected

**High Confidence Intents (98-100% accuracy):**
- Greetings: 100% satisfaction
- Programs: 99% satisfaction
- Location: 98% satisfaction
- Admission Requirements: 97% satisfaction

**Low Confidence Intents (77-87% accuracy):**
- Job Placement: 77-80% satisfaction (needs improvement)
- Tuition Fees IBM: 78-82% satisfaction (needs improvement)

**Fallback/Unknown:**
- nlu_fallback: 0% accuracy (users report "don't understand")

---

## Action Items Based on Survey Results

### If Overall Rating < 4.0:
- Increase training data
- Add more example utterances
- Improve response quality
- Simplify chatbot language

### If Intent Accuracy < 90%:
- Review NLU training data
- Add more entity variations
- Improve intent disambiguation
- Train on low-performing intents

### If Recommendation Rate < 75%:
- Major UX improvements needed
- Expand chatbot knowledge base
- Add more intents/capabilities
- Improve response times

---

## Quick Survey Questions (Minimal Version)

If you want a shorter survey:

1. Overall rating (1-5 stars)
2. Did the chatbot understand? (Yes/No/Partially)
3. Would you recommend? (Yes/No/Maybe)
4. Biggest improvement needed? (Open text)
5. Email (optional): ___________

---

## Survey Distribution Channels

1. **Chatbot Interface**: Add survey link after conversation
2. **College Website**: Embed form on chatbot page
3. **Email**: Send to prospective students
4. **Social Media**: Share on Instagram, Facebook, LinkedIn
5. **WhatsApp**: Send survey link via messaging
6. **QR Code**: Display in admissions office
7. **Landing Page**: Thank you page after chatbot use

---

## Expected Survey Timeline

- **Week 1**: Create survey and collect 50-100 responses
- **Week 2**: Analyze results and identify issues
- **Week 3**: Make improvements based on feedback
- **Week 4**: Collect follow-up responses to validate improvements

---

## Google Forms Features to Enable

✅ **Require sign-in**: Optional
✅ **Shuffle question order**: No (keep structured)
✅ **Show progress bar**: Yes
✅ **Collect email**: Optional
✅ **Limit to 1 response**: No (allow multiple responses)
✅ **Edit after submit**: No (maintain data integrity)

