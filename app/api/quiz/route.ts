import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const featured = searchParams.get('featured') === 'true';
        const type = searchParams.get('type');

        const skip = (page - 1) * limit;

        const where: any = {
            status: 1, // Only active quizzes
            divisionId: 1 // Default division
        };

        if (featured) {
            where.starFlag = 1;
        }

        if (type) {
            where.quizType = parseInt(type);
        }

        const [quizzes, total] = await Promise.all([
            prisma.quiz.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    subTitle: true,
                    image: true,
                    quizType: true,
                    visits: true,
                    createDate: true,
                    user: {
                        select: {
                            username: true,
                            title: true
                        }
                    }
                },
                orderBy: featured ? { visits: 'desc' } : { createDate: 'desc' },
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
        console.error('Error fetching quizzes:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}