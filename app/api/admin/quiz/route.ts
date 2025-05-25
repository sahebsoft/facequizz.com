import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';

const createQuizSchema = z.object({
    title: z.string().min(1).max(200),
    subTitle: z.string().optional(),
    quizType: z.number().int().min(1).max(3),
    image: z.string().optional(),
    randomFlag: z.boolean().default(false),
    scoreFlag: z.number().int().min(0).max(2).default(2),
    starFlag: z.boolean().default(false),
    status: z.number().int().min(1).max(2).default(2)
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.username) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const data = createQuizSchema.parse(body);

        const quiz = await prisma.quiz.create({
            data: {
                ...data,
                username: session.user.username,
                randomFlag: data.randomFlag ? 1 : 0,
                starFlag: data.starFlag ? 1 : 0
            },
            include: {
                questions: {
                    include: {
                        answers: true
                    }
                },
                results: true
            }
        });

        return NextResponse.json(quiz, { status: 201 });

    } catch (error) {
        console.error('Error creating quiz:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Invalid quiz data',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.username) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const where: any = {};

        // Non-admin users can only see their own quizzes
        if (session.user.userType !== 'a') {
            where.username = session.user.username;
        }

        const [quizzes, total] = await Promise.all([
            prisma.quiz.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    status: true,
                    quizType: true,
                    createDate: true,
                    updateDate: true,
                    visits: true,
                    username: true
                },
                orderBy: { updateDate: 'desc' },
                skip,
                take: limit
            }),
            prisma.quiz.count({ where })
        ]);

        return NextResponse.json({
            quizzes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching admin quizzes:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}