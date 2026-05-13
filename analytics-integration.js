/**
 * MathMate Analytics Integration
 * Send quiz completion data to Google Sheets webhook
 * 
 * Usage: sendQuizAnalytics(userId, topic, quizScore, questionsSolved)
 */

// Configuration
const ANALYTICS_CONFIG = {
    WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbxaqSK2dQD4mPDqWXtlX_0mtt6wCjWMkgQVJQ9K7-iODCS-yBiPVOFAShjhdE19IE_r/exec',
    TIMEOUT: 5000, // 5 seconds
    RETRY_ATTEMPTS: 3
};

/**
 * Send quiz analytics to Google Sheets
 * @param {string} userId - User ID
 * @param {string} topic - Quiz topic/subject
 * @param {number} quizScore - Score (0-100 or points)
 * @param {number} questionsSolved - Number of correct answers
 * @returns {Promise} Response from webhook
 */
async function sendQuizAnalytics(userId, topic, quizScore, questionsSolved) {
    const payload = {
          userId: userId,
          topic: topic,
          quizScore: quizScore,
          questionsSolved: questionsSolved
    };

  try {
        console.log('[MathMate Analytics] Sending:', payload);

      const response = await fetch(ANALYTICS_CONFIG.WEBHOOK_URL, {
              method: 'POST',
              headers: {
                        'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload),
              timeout: ANALYTICS_CONFIG.TIMEOUT
      });

      if (!response.ok) {
              throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
        console.log('[MathMate Analytics] Success:', data);
        return data;

  } catch (error) {
        console.error('[MathMate Analytics] Error:', error.message);
        throw error;
  }
}

/**
 * Send analytics with retry logic
 * @param {string} userId - User ID
 * @param {string} topic - Quiz topic
 * @param {number} quizScore - Score
 * @param {number} questionsSolved - Questions solved
 * @returns {Promise} Response from webhook
 */
async function sendQuizAnalyticsWithRetry(userId, topic, quizScore, questionsSolved) {
    let lastError;

  for (let attempt = 1; attempt <= ANALYTICS_CONFIG.RETRY_ATTEMPTS; attempt++) {
        try {
                console.log(`[MathMate Analytics] Attempt ${attempt}/${ANALYTICS_CONFIG.RETRY_ATTEMPTS}`);
                return await sendQuizAnalytics(userId, topic, quizScore, questionsSolved);
        } catch (error) {
                lastError = error;

          if (attempt < ANALYTICS_CONFIG.RETRY_ATTEMPTS) {
                    // Exponential backoff: 1s, 2s, 4s
                  const delay = Math.pow(2, attempt - 1) * 1000;
                    console.log(`[MathMate Analytics] Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
  }

  throw lastError;
}

/**
 * Event listener for quiz completion
 * Add this to your quiz completion button/form
 */
function initializeAnalytics() {
    // Example: Hook into quiz completion
  const quizForm = document.getElementById('quiz-form');
    if (quizForm) {
          quizForm.addEventListener('submit', async (e) => {
                  e.preventDefault();

                                          // Extract quiz data
                                          const userId = document.getElementById('user-id')?.value || 'unknown';
                  const topic = document.getElementById('topic')?.value || 'General';
                  const quizScore = calculateQuizScore(); // Implement your scoring logic
                                          const questionsSolved = document.querySelectorAll('input[type=radio]:checked').length;

                                          try {
                                                    await sendQuizAnalyticsWithRetry(userId, topic, quizScore, questionsSolved);
                                                    alert('Quiz results saved successfully!');
                                          } catch (error) {
                                                    console.error('Failed to save analytics:', error);
                                                    // Don't block quiz submission - show warning but allow continue
                    alert('Warning: Could not save analytics, but quiz was submitted.');
                                          }
          });
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnalytics);
} else {
    initializeAnalytics();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
          sendQuizAnalytics,
          sendQuizAnalyticsWithRetry,
          ANALYTICS_CONFIG
    };
}
