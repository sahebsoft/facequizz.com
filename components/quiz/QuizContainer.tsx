'use client';

import { useState, useEffect } from 'react';
import { QuestionComponent } from './QuestionComponent';
import { QuizResult } from './QuizResult';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QuizWithDetails, QuizResult as QuizResultType } from '@/types/quiz';

interface QuizContainerProps {
    quiz: QuizWithDetails;
}

export function QuizContainer({ quiz }: QuizContainerProps) {
    //const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<QuizResultType | null>(null);
    const [error, setError] = useState<string | null>(null);

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const allQuestionsAnswered = quiz.questions.every(q => selectedAnswers[q.id] !== undefined);

    useEffect(() => {
        // Track quiz start
        if (typeof window !== 'undefined') {
            // Add analytics tracking here
        }
    }, [quiz.id]);

    const handleAnswerSelect = (answerId: number) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: answerId
        }));
    };

    const handleNext = () => {
        if (!isLastQuestion) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (!isFirstQuestion) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!allQuestionsAnswered) {
            setError('يرجى الإجابة على جميع الأسئلة');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/quiz/${quiz.id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answers: selectedAnswers
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'حدث خطأ أثناء إرسال الإجابات');
            }

            const resultData = await response.json();
            setResult(resultData);

            // Track completion
            if (typeof window !== 'undefined') {
                // Add analytics tracking here
            }

        } catch (error) {
            console.error('Submit error:', error);
            setError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetake = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setResult(null);
        setError(null);
    };

    const handleShare = () => {
        // Share functionality is handled in QuizResult component
    };

    // Show result if quiz is completed
    if (result) {
        return (
            <QuizResult
                result={result}
                quiz={quiz}
                onShare={handleShare}
                onRetake={handleRetake}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                {error && (
                    <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (isLastQuestion && selectedAnswers[currentQuestion.id]) {
                            handleSubmit();
                        } else {
                            handleNext();
                        }
                    }}
                >
                    <QuestionComponent
                        question={currentQuestion}
                        selectedAnswer={selectedAnswers[currentQuestion.id]}
                        onAnswerSelect={handleAnswerSelect}
                        questionIndex={currentQuestionIndex}
                        totalQuestions={quiz.questions.length}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        isFirst={isFirstQuestion}
                        isLast={isLastQuestion}
                        disabled={isSubmitting}
                    />
                </form>

                {isSubmitting && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="text-center">
                            <LoadingSpinner size="lg" />
                            <p className="mt-4 text-lg">جاري حساب النتيجة...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}