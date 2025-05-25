import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QuizScoringEngine } from '@/lib/scoring';
import { z } from 'zod';

const submitSchema = z.object({
    answers: z.record(z.string(), z.number()) // questionId -> answerId
});

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const quizId = parseInt(params.id);

        if (isNaN(quizId)) {
            return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
        }

        const body = await request.json();
        const { answers } = submitSchema.parse(body);

        // Convert string keys to numbers
        const selectedAnswers = Object.fromEntries(
            Object.entries(answers).map(([qId, aId]) => [parseInt(qId), aId])
        );

        // Fetch quiz with all necessary data for scoring
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    include: {
                        answers: {
                            include: {
                                scores: true
                            }
                        }
                    }
                },
                results: {
                    include: {
                        scores: true
                    }
                }
            }
        });

        if (!quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        if (quiz.status !== 1) {
            return NextResponse.json({ error: 'Quiz not available' }, { status: 403 });
        }

        // Validate that all questions are answered
        const questionIds = quiz.questions.map(q => q.id);
        const answeredQuestions = Object.keys(selectedAnswers).map(id => parseInt(id));
        const missingQuestions = questionIds.filter(id => !answeredQuestions.includes(id));

        if (missingQuestions.length > 0) {
            return NextResponse.json({
                error: 'All questions must be answered',
                missingQuestions
            }, { status: 400 });
        }

        // Calculate result using scoring engine
        const scoringResult = QuizScoringEngine.calculateResult({
            quiz,
            selectedAnswers
        });

        // Get the result details
        const result = await prisma.result.findUnique({
            where: { id: scoringResult.resultId }
        });

        if (!result) {
            return NextResponse.json({ error: 'Result not found' }, { status: 500 });
        }

        // Track visit
        const clientIP = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const referer = request.headers.get('referer') || '';

        await prisma.visit.create({
            data: {
                quizId,
                resultId: result.id,
                visitType: 1, // Quiz completion
                ref: referer,
                ip: clientIP.split(',')[0].trim(),
                agent: userAgent
            }
        });

        // Generate score description
        const scoreDescription = QuizScoringEngine.generateScoreDescription(scoringResult, quiz);

        return NextResponse.json({
            result,
            score: scoringResult.score,
            maxScore: scoringResult.maxPossibleScore,
            scoreDescription,
            calculation: scoringResult.calculation
        });

    } catch (error) {
        console.error('Error submitting quiz:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Invalid submission data',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}