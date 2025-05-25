import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { QuizContainer } from '@/components/quiz/QuizContainer';
import { QuizStartCard } from '@/components/quiz/QuizStartCard';
import { prisma } from '@/lib/prisma';
import { QuizWithDetails } from '@/types/quiz';

interface QuizPageProps {
    params: { id: string };
    searchParams: { start?: string };
}

async function getQuiz(id: number): Promise<QuizWithDetails | null> {
    try {
        const quiz = await prisma.quiz.findUnique({
            where: {
                id,
                status: 1 // Only published quizzes
            },
            include: {
                questions: {
                    include: {
                        answers: {
                            include: {
                                scores: true
                            }
                        }
                    },
                    orderBy: { id: 'asc' }
                },
                results: {
                    include: {
                        scores: true
                    },
                    orderBy: { id: 'asc' }
                },
                user: {
                    select: {
                        username: true,
                        title: true,
                        adSlot: true
                    }
                }
            }
        });

        return quiz as QuizWithDetails;
    } catch (error) {
        console.error('Error fetching quiz:', error);
        return null;
    }
}

export async function generateMetadata({ params }: QuizPageProps): Promise<Metadata> {
    const quiz = await getQuiz(parseInt(params.id));

    if (!quiz) {
        return {
            title: 'اختبار غير موجود',
            description: 'الاختبار المطلوب غير متوفر'
        };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://facequizz.com';
    const imageUrl = quiz.image ? `${baseUrl}/images/${quiz.image}` : `${baseUrl}/og-default.jpg`;

    return {
        title: `${quiz.title} - فيس كويز`,
        description: quiz.subTitle || `اختبار ${quiz.title} - اكتشف المزيد عن شخصيتك`,
        openGraph: {
            title: quiz.title || 'اختبار فيس كويز',
            description: quiz.subTitle || 'اختبر معرفتك وشخصيتك',
            url: `${baseUrl}/quiz/${quiz.id}`,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: quiz.title || 'اختبار فيس كويز'
                }
            ],
            type: 'website',
            siteName: 'فيس كويز'
        },
        twitter: {
            card: 'summary_large_image',
            title: quiz.title || 'اختبار فيس كويز',
            description: quiz.subTitle || 'اختبر معرفتك وشخصيتك',
            images: [imageUrl],
            site: '@facequizz',
            creator: '@facequizz'
        },
        alternates: {
            canonical: `${baseUrl}/quiz/${quiz.id}`
        }
    };
}

export default async function QuizPage({ params, searchParams }: QuizPageProps) {
    const quizId = parseInt(params.id);

    if (isNaN(quizId)) {
        notFound();
    }

    const quiz = await getQuiz(quizId);

    if (!quiz) {
        notFound();
    }

    // Show start page if 'start' parameter is not present
    const showStart = !searchParams.start;

    if (showStart) {
        return <QuizStartCard quiz={quiz} />;
    }

    return <QuizContainer quiz={quiz} />;
}

