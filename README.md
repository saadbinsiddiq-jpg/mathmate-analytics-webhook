# MathMate Analytics Webhook Integration

**Send quiz completion data directly to Google Sheets for real-time analytics - NO BILLING REQUIRED**

## Overview

This repository provides integration code to connect your MathMate application to a Google Sheets-based analytics dashboard via webhook. When users complete a quiz, data is automatically sent to Google Sheets for tracking and analysis.

### Architecture

- **Frontend**: Your MathMate web/mobile app
- - **Webhook Receiver**: Google Apps Script (FREE)
  - - **Analytics Storage**: Google Sheets (FREE)
    - - **No Cloud Functions needed** - uses only free tier services
     
      - ## Quick Start
     
      - ### Step 1: Get Your Webhook URL
     
      - Your webhook endpoint is already deployed and ready:
     
      - ```
        https://script.google.com/macros/s/AKfycbxaqSK2dQD4mPDqWXtlX_0mtt6wCjWMkgQVJQ9K7-iODCS-yBiPVOFAShjhdE19IE_r/exec
        ```

        ### Step 2: Add Integration Code to Your App

        Add this function to your quiz completion handler:

        ```javascript
        // Call this when a quiz is completed
        async function sendQuizAnalytics(userId, topic, quizScore, questionsSolved) {
          const webhookURL = 'https://script.google.com/macros/s/AKfycbxaqSK2dQD4mPDqWXtlX_0mtt6wCjWMkgQVJQ9K7-iODCS-yBiPVOFAShjhdE19IE_r/exec';

          try {
            const response = await fetch(webhookURL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                userId: userId,
                topic: topic,
                quizScore: quizScore,
                questionsSolved: questionsSolved
              })
            });

            const data = await response.json();
            console.log('Analytics sent successfully:', data);
            return data;
          } catch (error) {
            console.error('Error sending analytics:', error);
          }
        }
        ```

        ### Step 3: Call on Quiz Completion

        ```javascript
        // In your quiz completion logic:
        await sendQuizAnalytics(
          currentUser.uid,           // User ID
          'Algebra',                 // Topic/Subject
          85,                        // Quiz Score (0-100)
          10                         // Questions Solved
        );
        ```

        ## Data Schema

        The webhook accepts JSON POST requests with the following fields:

        | Field | Type | Required | Description |
        |-------|------|----------|-------------|
        | `userId` | string | Yes | Unique identifier for the student |
        | `topic` | string | Yes | Subject or topic name |
        | `quizScore` | number | Yes | Score (0-100 or raw points) |
        | `questionsSolved` | number | Yes | Number of questions answered correctly |

        **Alternative Field Names**: The webhook is flexible and accepts:
        - `user_id`, `uid` (instead of `userId`)
        - - `subject` (instead of `topic`)
          - - `score`, `quiz_score` (instead of `quizScore`)
            - - `solved`, `questions_solved` (instead of `questionsSolved`)
             
              - ## Integration Examples
             
              - ### React/Vue Example
             
              - ```javascript
                // In your Quiz component
                const handleQuizSubmit = async (quizResults) => {
                  await sendQuizAnalytics(
                    authUser.id,
                    quizResults.subject,
                    quizResults.score,
                    quizResults.correctAnswers
                  );
                  // Redirect to results page
                };
                ```

                ### Firebase Integration

                ```javascript
                // In your Firebase Realtime Database listener
                db.ref(`users/${userId}/quizzes/${quizId}`).on('value', (snapshot) => {
                  const quiz = snapshot.val();
                  if (quiz.completed) {
                    sendQuizAnalytics(
                      userId,
                      quiz.topic,
                      quiz.score,
                      quiz.correctAnswers
                    );
                  }
                });
                ```

                ### Using Fetch (Vanilla JavaScript)

                ```javascript
                const form = document.getElementById('quiz-form');
                form.addEventListener('submit', async (e) => {
                  e.preventDefault();

                  const score = calculateScore();
                  const response = await sendQuizAnalytics(
                    document.getElementById('user-id').value,
                    'Mathematics',
                    score,
                    document.querySelectorAll('input[type=radio]:checked').length
                  );

                  alert('Quiz results saved!');
                });
                ```

                ## Viewing Analytics

                All data is automatically saved to this Google Sheet:

                **[MathMate Analytics Dashboard](https://docs.google.com/spreadsheets/d/15-vaBdzLyC7XBrCK6PefvkQ-Fk7bl1RJRN8F81eJShA/edit?gid=0#gid=0)**

                Columns in the spreadsheet:
                - **A**: Time Stamp (auto-generated)
                - - **B**: User ID
                  - - **C**: Topic
                    - - **D**: Quiz Score
                      - - **E**: Questions Solved
                       
                        - ## Webhook Response
                       
                        - Successful requests return JSON:
                       
                        - ```json
                          {
                            "status": "success",
                            "message": "Data received and stored successfully",
                            "data": {
                              "timeStamp": "5/13/2026, 2:45:30 PM",
                              "userId": "student123",
                              "topic": "Algebra",
                              "quizScore": 85,
                              "questionsSolved": 10
                            }
                          }
                          ```

                          ## Error Handling

                          The webhook includes error handling for:

                          - Missing event object
                          - - Invalid JSON payload
                            - - Missing required fields
                              - - Sheet access errors
                               
                                - Errors return JSON with error details:
                               
                                - ```json
                                  {
                                    "error": "Could not access sheet",
                                    "details": "..."
                                  }
                                  ```

                                  ## Debugging

                                  To debug the webhook:

                                  1. Check browser console for fetch errors
                                  2. 2. View Apps Script logs at: [Apps Script Executions](https://script.google.com/home/projects/1VHH0h36HKpX093oqMSZ69pnaTn8UbjK6onMpckBOAdqdgTV2EMiU2mvK/executions)
                                     3. 3. Look for detailed error messages in logs
                                       
                                        4. ## Rate Limits
                                       
                                        5. Google Apps Script has generous free limits:
                                        6. - **Requests per day**: 20,000
                                           - - **Executions per day**: 20,000
                                             - - **No billing required for free tier**
                                              
                                               - ## Testing
                                              
                                               - Test the webhook with curl:
                                              
                                               - ```bash
                                                 curl -X POST "https://script.google.com/macros/s/AKfycbxaqSK2dQD4mPDqWXtlX_0mtt6wCjWMkgQVJQ9K7-iODCS-yBiPVOFAShjhdE19IE_r/exec" \
                                                   -H "Content-Type: application/json" \
                                                   -d '{
                                                     "userId": "test-user-123",
                                                     "topic": "Algebra",
                                                     "quizScore": 92,
                                                     "questionsSolved": 12
                                                   }'
                                                 ```

                                                 ## FAQ

                                                 **Q: Does this cost money?**
                                                 A: No! Google Sheets and Apps Script are completely free for this use case.

                                                 **Q: What's the rate limit?**
                                                 A: 20,000 requests per day - plenty for most applications.

                                                 **Q: Can I modify the fields?**
                                                 A: Yes! The webhook accepts flexible field names. Just refer to the "Alternative Field Names" section.

                                                 **Q: How often are analytics updated?**
                                                 A: Immediately! Data appears in Google Sheets within 1-2 seconds of submission.

                                                 **Q: Can I share the analytics dashboard?**
                                                 A: Yes! Share the Google Sheet link with teachers or admins.

                                                 ## Support

                                                 For issues or questions, check:
                                                 1. The Google Sheets tab for data
                                                 2. 2. Apps Script execution logs for errors
                                                    3. 3. Browser console for client-side errors
                                                      
                                                       4. ## License
                                                      
                                                       5. MIT License - Feel free to use in your projects
                                                      
                                                       6. ---
                                                      
                                                       7. **Created for MathMate Analytics Integration**
                                                       8. **Last Updated**: May 13, 2026
