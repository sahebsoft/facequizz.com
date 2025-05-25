import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Star } from 'lucide-react';
import { Quiz } from '@/types/quiz';
import { cn } from '@/lib/utils';

interface QuizCardProps {
    quiz: Quiz & {
        user?: {
            username: string;
            title?: string;
        };
    };
    showAdminActions?: boolean;
    className?: string;
}

const quizTypeLabels = {
    1: 'اختبار شخصية',
    2: 'اختبار معرفة',
    3: 'لغز'
};

const quizTypeBadgeColors = {
    1: 'bg-purple-100 text-purple-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-green-100 text-green-800'
};

export function QuizCard({ quiz, showAdminActions, className }: QuizCardProps) {
    if (quiz === undefined) return null;
    let truncatedDescription = null;
    if (quiz.subTitle !== undefined) {
        truncatedDescription = quiz.subTitle?.length > 100
            ? quiz.subTitle.substring(0, 100) + '...'
            : quiz.subTitle;
    }

    return (
        <Card className={cn('h-full flex flex-col transition-all hover:shadow-lg', className)}>
            <CardHeader className="pb-3">
                {quiz.image && (
                    <div className="relative w-full h-48 mb-3 rounded-md overflow-hidden">
                        <Image
                            src={`/images/${quiz.image}`}
                            alt={quiz.title || 'Quiz image'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {quiz.starFlag === 1 && (
                            <Badge className="absolute top-2 right-2 bg-yellow-500">
                                <Star className="w-3 h-3 mr-1" />
                                مميز
                            </Badge>
                        )}
                    </div>
                )}

                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                        {quiz.title}
                    </CardTitle>
                    <Badge className={quizTypeBadgeColors[quiz.quizType]}>
                        {quizTypeLabels[quiz.quizType]}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="flex-1 pb-3">
                {truncatedDescription && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {truncatedDescription}
                    </p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{quiz.visits.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(quiz.createDate).toLocaleDateString('ar-EG')}</span>
                    </div>
                </div>

                {quiz.user && (
                    <p className="text-xs text-muted-foreground mt-2">
                        بواسطة: {quiz.user.title || quiz.user.username}
                    </p>
                )}
            </CardContent>

            <CardFooter className="pt-0">
                <div className="flex gap-2 w-full">
                    <Button asChild className="flex-1">
                        <Link href={`/quiz/${quiz.id}`}>
                            ابدأ الاختبار
                        </Link>
                    </Button>

                    {showAdminActions && (
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/quiz/${quiz.id}/edit`}>
                                تعديل
                            </Link>
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}