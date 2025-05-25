import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Question, Answer } from '@/types/quiz';
import { cn } from '@/lib/utils';

interface QuestionComponentProps {
    question: Question & { answers: Answer[] };
    selectedAnswer?: number;
    onAnswerSelect: (answerId: number) => void;
    questionIndex: number;
    totalQuestions: number;
    onNext?: () => void;
    onPrevious?: () => void;
    isFirst: boolean;
    isLast: boolean;
    disabled?: boolean;
}

export function QuestionComponent({
    question,
    selectedAnswer,
    onAnswerSelect,
    questionIndex,
    totalQuestions,
    onNext,
    onPrevious,
    isFirst,
    isLast,
    disabled
}: QuestionComponentProps) {
    const [showError, setShowError] = useState(false);

    const handleNext = () => {
        if (!selectedAnswer) {
            setShowError(true);
            return;
        }
        setShowError(false);
        onNext?.();
    };

    const handleAnswerChange = (value: string) => {
        const answerId = parseInt(value);
        onAnswerSelect(answerId);
        setShowError(false);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-muted-foreground">
                        السؤال {questionIndex + 1} من {totalQuestions}
                    </div>
                    <div className="w-full max-w-xs bg-secondary rounded-full h-2 ml-4">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
                        />
                    </div>
                </div>

                <CardTitle className="text-xl md:text-2xl text-right leading-relaxed">
                    {question.title}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {question.image && (
                    <div className="relative w-full max-w-2xl mx-auto h-64 md:h-80 rounded-lg overflow-hidden">
                        <Image
                            src={`/images/${question.image}`}
                            alt="Question image"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                )}

                {question.youtubeCode && (
                    <div className="relative w-full max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden">
                        <iframe
                            src={`https://www.youtube.com/embed/${question.youtubeCode}?rel=0&controls=1&showinfo=0`}
                            className="w-full h-full"
                            allowFullScreen
                            title="Question video"
                        />
                    </div>
                )}

                <div className="space-y-4">
                    <RadioGroup
                        value={selectedAnswer?.toString() || ''}
                        onValueChange={handleAnswerChange}
                        disabled={disabled}
                        className="space-y-3"
                    >
                        {question.answers.map((answer) => (
                            <div
                                key={answer.id}
                                className={cn(
                                    'flex items-center space-x-3 space-x-reverse p-4 rounded-lg border transition-all hover:bg-muted/50',
                                    selectedAnswer === answer.id && 'border-primary bg-primary/5'
                                )}
                            >
                                <RadioGroupItem
                                    value={answer.id.toString()}
                                    id={`answer-${answer.id}`}
                                    className="flex-shrink-0"
                                />
                                <Label
                                    htmlFor={`answer-${answer.id}`}
                                    className="flex-1 text-right cursor-pointer text-base leading-relaxed"
                                >
                                    {answer.title}
                                </Label>
                                {answer.image && (
                                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                        <Image
                                            src={`/images/${answer.image}`}
                                            alt="Answer image"
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </RadioGroup>

                    {showError && (
                        <p className="text-destructive text-sm text-center">
                            يرجى اختيار إجابة قبل المتابعة
                        </p>
                    )}
                </div>

                <div className="flex justify-between items-center pt-6">
                    <Button
                        variant="outline"
                        onClick={onPrevious}
                        disabled={isFirst || disabled}
                    >
                        السؤال السابق
                    </Button>

                    <Button
                        onClick={isLast ? undefined : handleNext}
                        disabled={disabled}
                        type={isLast ? "submit" : "button"}
                        className={cn(
                            isLast && "bg-green-600 hover:bg-green-700"
                        )}
                    >
                        {isLast ? 'احصل على النتيجة' : 'السؤال التالي'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}