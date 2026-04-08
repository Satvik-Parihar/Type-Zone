/**
 * AI Features Service
 * Provides intelligent analysis and personalized coaching
 */

class AIFeaturesService {
  /**
   * Analyze typing mistakes and identify weak keys
   */
  static analyzeWeakKeys(typingHistory) {
    const keyErrors = {};
    let totalTests = 0;

    typingHistory.forEach((test) => {
      totalTests++;
      test.mistakes?.forEach((mistake) => {
        const key = mistake.incorrectKey || mistake.key;
        if (!keyErrors[key]) {
          keyErrors[key] = { count: 0, totalAttempts: 0 };
        }
        keyErrors[key].count++;
        keyErrors[key].totalAttempts++;
      });
    });

    // Calculate error rate for each key
    const weakKeys = Object.entries(keyErrors)
      .map(([key, data]) => ({
        key,
        errors: data.count,
        errorRate: (data.count / Math.max(1, data.totalAttempts)) * 100,
      }))
      .sort((a, b) => b.errors - a.errors)
      .slice(0, 10); // Top 10 weak keys

    return weakKeys;
  }

  /**
   * Generate personalized practice recommendations
   */
  static generatePracticeRecommendations(userStats, weakKeys) {
    const recommendations = [];

    if (userStats.averageAccuracy < 90) {
      recommendations.push({
        type: 'accuracy',
        title: 'Improve Accuracy',
        description: 'Your accuracy is below 90%. Focus on precision over speed.',
        action: 'Practice with "Code" mode at medium difficulty',
        priority: 'high',
      });
    }

    if (userStats.averageAccuracy > 95 && userStats.averageWpm < 100) {
      recommendations.push({
        type: 'speed',
        title: 'Boost Speed',
        description: 'You have excellent accuracy. Time to increase your typing speed!',
        action: 'Try "Time" mode with 60-second challenges',
        priority: 'high',
      });
    }

    if (weakKeys.length > 0) {
      const topWeakKey = weakKeys[0];
      recommendations.push({
        type: 'weak-keys',
        title: `Master "${topWeakKey.key.toUpperCase()}"`,
        description: `You make errors on "${topWeakKey.key}" ${topWeakKey.errors} times. Practice this specifically.`,
        action: `Create a custom test with words containing "${topWeakKey.key}"`,
        priority: 'medium',
      });
    }

    if (userStats.consistency < 80) {
      recommendations.push({
        type: 'consistency',
        title: 'Improve Consistency',
        description: 'Your typing speed varies too much. Work on maintaining rhythm.',
        action: 'Try "Zen" mode to practice steady pace',
        priority: 'medium',
      });
    }

    const daysSinceLastTest = (Date.now() - new Date(userStats.lastTestDate)) / (1000 * 60 * 60 * 24);
    if (daysSinceLastTest > 3) {
      recommendations.push({
        type: 'motivation',
        title: 'Get Back to Practice',
        description: `You haven't typed in ${Math.floor(daysSinceLastTest)} days. Consistency is key!`,
        action: 'Start a quick 15-second challenge to warm up',
        priority: 'low',
      });
    }

    return recommendations;
  }

  /**
   * Calculate adaptive difficulty based on performance
   */
  static calculateAdaptiveDifficulty(userStats) {
    const { averageWpm, averageAccuracy, testsCompleted } = userStats;

    if (testsCompleted < 3) {
      return 'easy'; // Start with easy mode for new users
    }

    // If accuracy is too low, suggest easier difficulty
    if (averageAccuracy < 85) {
      return 'easy';
    }

    if (averageAccuracy < 92) {
      return 'medium';
    }

    // If accuracy is high, suggest harder mode
    if (averageAccuracy >= 95) {
      return 'hard';
    }

    return 'medium';
  }

  /**
   * Detect typing patterns (rush, fatigue, etc.)
   */
  static detectTypingPatterns(testMetrics) {
    const patterns = [];

    // Check for rushing (high WPM, low accuracy)
    if (testMetrics.wpm > 150 && testMetrics.accuracy < 88) {
      patterns.push({
        type: 'rushing',
        message: 'You seem to be rushing. Slow down slightly for better accuracy.',
        severity: 'warning',
      });
    }

    // Check for typing fatigue (decreasing WPM over time)
    if (testMetrics.wpmTrend < -5) {
      patterns.push({
        type: 'fatigue',
        message: 'You might be getting tired. Take a short break!',
        severity: 'info',
      });
    }

    // Check for inconsistency (high WPM variance)
    if (testMetrics.consistency < 70) {
      patterns.push({
        type: 'inconsistency',
        message: 'Try to maintain a more consistent typing pace.',
        severity: 'info',
      });
    }

    return patterns;
  }

  /**
   * Calculate typing streak and motivation score
   */
  static calculateMotivationScore(userStats) {
    const { testsCompleted, bestWpm, averageAccuracy, streakDays } = userStats;

    let score = 0;

    // Base score from tests completed
    score += Math.min(testsCompleted * 2, 50);

    // Bonus for high accuracy
    if (averageAccuracy > 95) score += 25;
    else if (averageAccuracy > 90) score += 15;
    else if (averageAccuracy > 85) score += 10;

    // Bonus for good WPM
    if (bestWpm > 150) score += 20;
    else if (bestWpm > 100) score += 10;

    // Bonus for streak
    score += streakDays * 3;

    return Math.min(score, 100);
  }

  /**
   * Predict user WPM potential based on current progress
   */
  static predictWPMPotential(userStats, weakKeys) {
    const { averageWpm, averageAccuracy, testsCompleted } = userStats;

    // If not enough data
    if (testsCompleted < 5) {
      return { predicted: averageWpm * 1.15, timeframe: '2-3 weeks' };
    }

    // Calculate improvement potential
    const accuracyGap = 98 - averageAccuracy;
    const improvementFactor = 1 + (accuracyGap * 0.003) + (weakKeys.length * 0.01);

    const predictedWPM = Math.round(averageWpm * improvementFactor);

    return {
      predicted: predictedWPM,
      timeframe: '4-8 weeks',
      potentialImprovement: predictedWPM - averageWpm,
    };
  }
}

export default AIFeaturesService;
