import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Clock, Users, Star, CheckCircle } from 'lucide-react';
import { QuizWithDetails } from '@/types/quiz';

interface QuizStartCardProps {
    quiz: QuizWithDetails;
}

const quizTypeLabels = {
    1: 'اختبار شخصية',
    2: 'اختبار معرفة',
    3: 'لغز'
};

const quizTypeDescriptions = {
    1: 'اكتشف المزيد عن شخصيتك وصفاتك',
    2: 'اختبر معلوماتك ومعرفتك',
    3: 'حل هذا اللغز الشيق'
};

export function QuizStartCard({ quiz }: QuizStartCardProps) {
    const estimatedTime = Math.max(2, Math.ceil(quiz.questions.length * 0.5)); // 30 seconds per question minimum

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <Card className="overflow-hidden">
                        <CardHeader className="text-center space-y-4">
                            {quiz.starFlag === 1 && (
                                <Badge className="bg-yellow-500 text-yellow-900 mx-auto">
                                    <Star className="w-4 h-4 mr-2" />
                                    اختبار مميز
                                </Badge>
                            )}

                            <CardTitle className="text-3xl md:text-4xl leading-relaxed">
                                {quiz.title}
                            </CardTitle>

                            <Badge variant="secondary" className="text-lg p-2">
                                {quizTypeLabels[quiz.quizType]}
                            </Badge>
                        </CardHeader>

                        <CardContent className="space-y-8">
                            {quiz.image && (
                                <div className="relative w-full max-w-2xl mx-auto h-64 md:h-80 rounded-lg overflow-hidden">
                                    <Image
                                        src={`/images/${quiz.image}`}
                                        alt={quiz.title || 'Quiz image'}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority
                                    />
                                </div>
                            )}

                            {quiz.subTitle && (
                                <div className="text-center">
                                    <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                        {quiz.subTitle}
                                    </p>
                                </div>
                            )}

                            <div className="text-center">
                                <p className="text-muted-foreground">
                                    {quizTypeDescriptions[quiz.quizType]}
                                </p>
                            </div>

                            <Separator />

                            {/* Quiz Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div className="flex flex-col items-center space-y-2">
                                    <CheckCircle className="w-8 h-8 text-primary" />
                                    <div>
                                        <p className="font-semibold">{quiz.questions.length}</p>
                                        <p className="text-sm text-muted-foreground">سؤال</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center space-y-2">
                                    <Clock className="w-8 h-8 text-primary" />
                                    <div>
                                        <p className="font-semibold">~{estimatedTime} دقائق</p>
                                        <p className="text-sm text-muted-foreground">الوقت المتوقع</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center space-y-2">
                                    <Users className="w-8 h-8 text-primary" />
                                    <div>
                                        <p className="font-semibold">{quiz.visits.toLocaleString()}</p>
                                        <p className="text-sm text-muted-foreground">شخص أجرى الاختبار</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Start Button */}
                            <div className="text-center space-y-4">
                                <Button
                                    asChild
                                    size="lg"
                                    className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                                >
                                    <Link href={`/quiz/${quiz.id}?start=1`} className="flex items-center gap-3">
                                        <Play className="w-5 h-5" />
                                        ابدأ الاختبار الآن
                                    </Link>
                                </Button>

                                <p className="text-xs text-muted-foreground">
                                    الاختبار مجاني تماماً ولا يتطلب تسجيل دخول
                                </p>
                            </div>

                            {/* Creator Info */}
                            {quiz.user && (
                                <div className="text-center pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        بواسطة: {quiz.user.title || quiz.user.username}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Additional Instructions */}
                    <Card className="mt-6">
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-semibold mb-4 text-center">كيفية إجراء الاختبار</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="text-center space-y-2">
                                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                                        1
                                    </div>
                                    <p>اقرأ كل سؤال بعناية</p>
                                </div>
                                <div className="text-center space-y-2">
                                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                                        2
                                    </div>
                                    <p>اختر الإجابة التي تناسبك أكثر</p>
                                </div>
                                <div className="text-center space-y-2">
                                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                                        3
                                    </div>
                                    <p>احصل على النتيجة وشاركها</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}