// lib/scoring.ts
import {
    QuizWithDetails,
    ScoringContext,
    ScoringResult,
    PersonalityScoring,
    KnowledgeScoring,
    PuzzleScoring
} from '@/types/quiz';

export class QuizScoringEngine {
    /**
     * Main scoring method that determines the appropriate algorithm based on quiz type
     */
    static calculateResult(context: ScoringContext): ScoringResult {
        const { quiz, selectedAnswers } = context;

        switch (quiz.quizType) {
            case 1: // Personality Quiz
                return this.calculatePersonalityResult(context);
            case 2: // Knowledge Quiz
                return this.calculateKnowledgeResult(context);
            case 3: // Puzzle Quiz
                return this.calculatePuzzleResult(context);
            default:
                throw new Error(`Unsupported quiz type: ${quiz.quizType}`);
        }
    }

    /**
     * Personality Quiz Scoring (Type 1)
     * Uses score associations where different answers contribute to different personality results
     */
    private static calculatePersonalityResult(context: ScoringContext): ScoringResult {
        const { quiz, selectedAnswers } = context;

        // Group scores by result ID
        const resultScores = new Map<number, number>();
        const contributions = new Map<number, Array<{
            questionId: number;
            answerId: number;
            scoreValue: number;
        }>>();

        // Initialize result scores
        quiz.results.forEach(result => {
            resultScores.set(result.id, 0);
            contributions.set(result.id, []);
        });

        // Calculate scores for each result based on selected answers
        Object.entries(selectedAnswers).forEach(([questionIdStr, answerId]) => {
            const questionId = parseInt(questionIdStr);

            // Find all score associations for this answer
            const answer = quiz.questions
                .flatMap(q => q.answers)
                .find(a => a.id === answerId);

            if (answer?.scores) {
                answer.scores.forEach(score => {
                    const currentScore = resultScores.get(score.resultId) || 0;
                    resultScores.set(score.resultId, currentScore + score.scoreValue);

                    // Track contribution for debugging/transparency
                    const resultContributions = contributions.get(score.resultId) || [];
                    resultContributions.push({
                        questionId,
                        answerId,
                        scoreValue: score.scoreValue
                    });
                    contributions.set(score.resultId, resultContributions);
                });
            }
        });

        // Find the result with the highest score
        let winningResultId = 0;
        let highestScore = -1;

        resultScores.forEach((score, resultId) => {
            if (score > highestScore) {
                highestScore = score;
                winningResultId = resultId;
            }
        });

        const personalityScoring: PersonalityScoring = {
            resultScores: Array.from(resultScores.entries()).map(([resultId, totalScore]) => ({
                resultId,
                totalScore,
                contributions: contributions.get(resultId) || []
            })),
            winningResult: {
                resultId: winningResultId,
                totalScore: highestScore
            }
        };

        return {
            resultId: winningResultId,
            score: highestScore,
            maxPossibleScore: this.calculateMaxPersonalityScore(quiz),
            calculation: {
                type: 'personality',
                details: personalityScoring
            }
        };
    }

    /**
     * Knowledge Quiz Scoring (Type 2)
     * Sums points from correct answers and matches against result point ranges
     */
    private static calculateKnowledgeResult(context: ScoringContext): ScoringResult {
        const { quiz, selectedAnswers } = context;

        let totalPoints = 0;
        const questionScores: Array<{
            questionId: number;
            answerId: number;
            points: number;
            isCorrect: boolean;
        }> = [];

        // Calculate total points from selected answers
        Object.entries(selectedAnswers).forEach(([questionIdStr, answerId]) => {
            const questionId = parseInt(questionIdStr);

            const answer = quiz.questions
                .flatMap(q => q.answers)
                .find(a => a.id === answerId);

            if (answer) {
                totalPoints += answer.points;
                questionScores.push({
                    questionId,
                    answerId,
                    points: answer.points,
                    isCorrect: answer.points > 0
                });
            }
        });

        // Find the appropriate result based on point range
        const matchingResult = quiz.results.find(result =>
            totalPoints >= result.pointFrom && totalPoints <= result.pointTo
        );

        if (!matchingResult) {
            throw new Error(`No result found for score: ${totalPoints}`);
        }

        const maxPossiblePoints = Math.max(...quiz.results.map(r => r.pointTo));
        const correctAnswers = questionScores.filter(qs => qs.isCorrect).length;

        const knowledgeScoring: KnowledgeScoring = {
            totalPoints,
            maxPossiblePoints,
            correctAnswers,
            totalQuestions: quiz.questions.length,
            questionScores
        };

        return {
            resultId: matchingResult.id,
            score: totalPoints,
            maxPossibleScore: maxPossiblePoints,
            calculation: {
                type: 'knowledge',
                details: knowledgeScoring
            }
        };
    }

    /**
     * Puzzle Quiz Scoring (Type 3)
     * Binary correct/incorrect with detailed feedback
     */
    private static calculatePuzzleResult(context: ScoringContext): ScoringResult {
        const { quiz, selectedAnswers } = context;

        if (quiz.questions.length !== 1) {
            throw new Error('Puzzle quiz must have exactly one question');
        }

        const question = quiz.questions[0];
        const selectedAnswerId = Object.values(selectedAnswers)[0];

        // Find the correct answer (the one with points = 1)
        const correctAnswer = question.answers.find(a => a.points === 1);
        const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId);

        if (!correctAnswer || !selectedAnswer) {
            throw new Error('Invalid puzzle quiz configuration');
        }

        const isCorrect = selectedAnswerId === correctAnswer.id;
        const points = isCorrect ? 1 : 0;

        // Find the appropriate result (1,1 for correct, 0,0 for incorrect)
        const matchingResult = quiz.results.find(result =>
            result.pointFrom === points && result.pointTo === points
        );

        if (!matchingResult) {
            throw new Error(`No result found for puzzle score: ${points}`);
        }

        const puzzleScoring: PuzzleScoring = {
            isCorrect,
            selectedAnswerId,
            correctAnswerId: correctAnswer.id,
            points
        };

        return {
            resultId: matchingResult.id,
            score: points,
            maxPossibleScore: 1,
            calculation: {
                type: 'puzzle',
                details: puzzleScoring
            }
        };
    }

    /**
     * Calculate maximum possible score for personality quizzes
     */
    private static calculateMaxPersonalityScore(quiz: QuizWithDetails): number {
        // For personality quizzes, max score is theoretical based on highest contributions
        let maxScore = 0;

        quiz.questions.forEach(question => {
            const maxAnswerScore = Math.max(
                ...question.answers.flatMap(answer =>
                    answer.scores?.map(score => score.scoreValue) || [0]
                )
            );
            maxScore += maxAnswerScore;
        });

        return maxScore;
    }

    /**
     * Generate score description string for display
     */
    static generateScoreDescription(result: ScoringResult, quiz: QuizWithDetails): string {
        const { score, maxPossibleScore } = result;

        switch (quiz.quizType) {
            case 1: // Personality - usually no numeric score shown
                return '';
            case 2: // Knowledge
                return `${score} من ${maxPossibleScore}`;
            case 3: // Puzzle
                return `${score} من ${maxPossibleScore}`;
            default:
                return '';
        }
    }

    /**
     * Validate quiz configuration for scoring
     */
    static validateQuizConfiguration(quiz: QuizWithDetails): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Common validations
        if (!quiz.questions.length) {
            errors.push('Quiz must have at least one question');
        }

        if (!quiz.results.length) {
            errors.push('Quiz must have at least one result');
        }

        // Type-specific validations
        switch (quiz.quizType) {
            case 1: // Personality
                this.validatePersonalityQuiz(quiz, errors);
                break;
            case 2: // Knowledge
                this.validateKnowledgeQuiz(quiz, errors);
                break;
            case 3: // Puzzle
                this.validatePuzzleQuiz(quiz, errors);
                break;
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    private static validatePersonalityQuiz(quiz: QuizWithDetails, errors: string[]): void {
        // Check that all answers have score associations
        quiz.questions.forEach((question, qIndex) => {
            question.answers.forEach((answer, aIndex) => {
                if (!answer.scores?.length) {
                    errors.push(`Question ${qIndex + 1}, Answer ${aIndex + 1} has no score associations`);
                }
            });
        });

        // Check that all results have some score associations
        quiz.results.forEach((result, rIndex) => {
            const hasScores = quiz.questions.some(q =>
                q.answers.some(a =>
                    a.scores?.some(s => s.resultId === result.id && s.scoreValue > 0)
                )
            );
            if (!hasScores) {
                errors.push(`Result ${rIndex + 1} has no positive score associations`);
            }
        });
    }

    private static validateKnowledgeQuiz(quiz: QuizWithDetails, errors: string[]): void {
        // Check that point ranges don't overlap and cover all possible scores
        const ranges = quiz.results.map(r => ({ from: r.pointFrom, to: r.pointTo }));
        ranges.sort((a, b) => a.from - b.from);

        for (let i = 0; i < ranges.length - 1; i++) {
            if (ranges[i].to >= ranges[i + 1].from) {
                errors.push('Result point ranges overlap');
                break;
            }
        }

        // Check that each question has at least one answer with points > 0
        quiz.questions.forEach((question, qIndex) => {
            const hasCorrectAnswer = question.answers.some(a => a.points > 0);
            if (!hasCorrectAnswer) {
                errors.push(`Question ${qIndex + 1} has no correct answers (points > 0)`);
            }
        });
    }

    private static validatePuzzleQuiz(quiz: QuizWithDetails, errors: string[]): void {
        if (quiz.questions.length !== 1) {
            errors.push('Puzzle quiz must have exactly one question');
        }

        if (quiz.results.length !== 2) {
            errors.push('Puzzle quiz must have exactly two results (correct/incorrect)');
        }

        const question = quiz.questions[0];
        if (question) {
            const correctAnswers = question.answers.filter(a => a.points === 1);
            if (correctAnswers.length !== 1) {
                errors.push('Puzzle quiz must have exactly one correct answer (points = 1)');
            }

            const incorrectAnswers = question.answers.filter(a => a.points === 0);
            if (incorrectAnswers.length === 0) {
                errors.push('Puzzle quiz must have at least one incorrect answer (points = 0)');
            }
        }

        // Check result point ranges
        const correctResult = quiz.results.find(r => r.pointFrom === 1 && r.pointTo === 1);
        const incorrectResult = quiz.results.find(r => r.pointFrom === 0 && r.pointTo === 0);

        if (!correctResult) {
            errors.push('Puzzle quiz missing correct result (pointFrom=1, pointTo=1)');
        }

        if (!incorrectResult) {
            errors.push('Puzzle quiz missing incorrect result (pointFrom=0, pointTo=0)');
        }
    }
}