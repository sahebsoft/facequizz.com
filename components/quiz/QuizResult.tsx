import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Share2, RotateCcw, Home, Facebook, Twitter } from 'lucide-react';
import { Quiz, QuizResult as QuizResultType } from '@/types/quiz';
import { cn } from '@/lib/utils';

interface QuizResultProps {
    result: QuizResultType;
    quiz: Quiz;
    onShare?: () => void;
    onRetake?: () => void;
    className?: string;
}

export function QuizResult({ result, quiz, onRetake, className }: QuizResultProps) {
    const [isSharing, setIsSharing] = useState(false);

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/quiz/${quiz.id}/result/${result.result.id}`
        : '';

    const shareText = `حصلت على نتيجة "${result.result.title}" في اختبار "${quiz.title}"`;

    const handleFacebookShare = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=580,height=296');
    };

    const handleTwitterShare = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=580,height=296');
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                setIsSharing(true);
                await navigator.share({
                    title: shareText,
                    url: shareUrl,
                });
            } catch (error) {
                console.log('Share cancelled or failed:', error);
            } finally {
                setIsSharing(false);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        }
    };

    return (
        <div className={cn('w-full max-w-4xl mx-auto space-y-6', className)}>
            {/* Main Result Card */}
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl text-right leading-relaxed mb-4">
                        {result.result.title}
                    </CardTitle>

                    {result.scoreDescription && quiz.scoreFlag === 1 && (
                        <Badge variant="secondary" className="text-lg p-2 mx-auto">
                            {result.scoreDescription}
                        </Badge>
                    )}
                </CardHeader>

                <CardContent className="space-y-6">
                    {result.result.image && (
                        <div className="relative w-full max-w-md mx-auto h-64 md:h-80 rounded-lg overflow-hidden">
                            <Image
                                src={`/images/${result.result.image}`}
                                alt={result.result.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                        </div>
                    )}

                    {result.result.subTitle && (
                        <div className="prose prose-lg max-w-none text-right">
                            <p className="whitespace-pre-wrap leading-relaxed">
                                {result.result.subTitle}
                            </p>
                        </div>
                    )}

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Button
                            onClick={onRetake}
                            variant="outline"
                            size="lg"
                            className="flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            إعادة الاختبار
                        </Button>

                        <Button
                            onClick={handleNativeShare}
                            disabled={isSharing}
                            size="lg"
                            className="flex items-center gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            {isSharing ? 'جاري المشاركة...' : 'شارك النتيجة'}
                        </Button>
                    </div>

                    {/* Social Share Buttons */}
                    <div className="flex justify-center gap-4">
                        <Button
                            onClick={handleFacebookShare}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        >
                            <Facebook className="w-4 h-4" />
                            فيسبوك
                        </Button>

                        <Button
                            onClick={handleTwitterShare}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200"
                        >
                            <Twitter className="w-4 h-4" />
                            تويتر
                        </Button>
                    </div>

                    <Separator />

                    {/* Navigation */}
                    <div className="flex justify-center">
                        <Button asChild variant="ghost">
                            <Link href="/" className="flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                المزيد من الاختبارات
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Quiz Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-right">عن هذا الاختبار</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="text-right">
                            <span className="font-medium">عنوان الاختبار:</span>
                            <p className="mt-1">{quiz.title}</p>
                        </div>

                        {quiz.subTitle && (
                            <div className="text-right">
                                <span className="font-medium">وصف الاختبار:</span>
                                <p className="mt-1 line-clamp-3">{quiz.subTitle}</p>
                            </div>
                        )}

                        <div className="text-right">
                            <span className="font-medium">نوع الاختبار:</span>
                            <p className="mt-1">
                                {quiz.quizType === 1 && 'اختبار شخصية'}
                                {quiz.quizType === 2 && 'اختبار معرفة'}
                                {quiz.quizType === 3 && 'لغز'}
                            </p>
                        </div>

                        <div className="text-right">
                            <span className="font-medium">تم إجراء الاختبار:</span>
                            <p className="mt-1">{quiz.visits.toLocaleString()} مرة</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}