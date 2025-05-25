import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const quizId = parseInt(params.id);

        if (isNaN(quizId)) {
            return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
        }

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

        if (!quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        // Check if quiz is published or user has permission to view
        const session = await getServerSession(authOptions);
        const canView = quiz.status === 1 ||
            session?.user?.username === quiz.username ||
            session?.user?.userType === 'a';

        if (!canView) {
            return NextResponse.json({ error: 'Quiz not available' }, { status: 403 });
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}