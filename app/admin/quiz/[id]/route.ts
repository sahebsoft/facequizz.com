// app/api/admin/quiz/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.username) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check admin permissions
        if (session.user.userType !== 'a') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const quizId = parseInt(params.id)

        if (isNaN(quizId)) {
            return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 })
        }

        // Check if quiz exists
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId }
        })

        if (!quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
        }

        // Delete quiz and all related data (cascading delete handled by Prisma schema)
        await prisma.quiz.delete({
            where: { id: quizId }
        })

        return NextResponse.json({ success: true, message: 'Quiz deleted successfully' })

    } catch (error) {
        console.error('Error deleting quiz:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.username) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const quizId = parseInt(params.id)

        if (isNaN(quizId)) {
            return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 })
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
                        title: true
                    }
                }
            }
        })

        if (!quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
        }

        // Check if user has permission to view this quiz
        const canView = quiz.status === 1 ||
            quiz.username === session.user.username ||
            session.user.userType === 'a'

        if (!canView) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        return NextResponse.json(quiz)

    } catch (error) {
        console.error('Error fetching quiz:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.username) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const quizId = parseInt(params.id)

        if (isNaN(quizId)) {
            return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 })
        }

        const body = await request.json()

        // Check if quiz exists and user has permission
        const existingQuiz = await prisma.quiz.findUnique({
            where: { id: quizId }
        })

        if (!existingQuiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
        }

        const canEdit = existingQuiz.username === session.user.username ||
            session.user.userType === 'a'

        if (!canEdit) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        // Update quiz
        const updatedQuiz = await prisma.quiz.update({
            where: { id: quizId },
            data: {
                title: body.title,
                subTitle: body.subTitle,
                quizType: body.quizType,
                image: body.image,
                randomFlag: body.randomFlag ? 1 : 0,
                scoreFlag: body.scoreFlag,
                starFlag: body.starFlag ? 1 : 0,
                status: body.status,
                updateDate: new Date()
            }
        })

        return NextResponse.json(updatedQuiz)

    } catch (error) {
        console.error('Error updating quiz:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}