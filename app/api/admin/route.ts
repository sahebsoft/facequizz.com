import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)

        if (!session?.user?.username) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check admin permissions
        if (session.user.userType !== 'a') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Fetch dashboard statistics
        const [totalQuizzes, totalUsers, totalVisits, recentQuizzes, popularQuizzes] = await Promise.all([
            // Total quizzes count
            prisma.quiz.count({
                where: {
                    status: 1 // Active quizzes only
                }
            }),

            // Total users count
            prisma.user.count(),

            // Total visits (aggregate from visits table)
            prisma.visit.count(),

            // Recent quizzes (last 10)
            prisma.quiz.findMany({
                where: {
                    status: 1
                },
                include: {
                    user: {
                        select: {
                            username: true,
                            title: true
                        }
                    }
                },
                orderBy: {
                    createDate: 'desc'
                },
                take: 10
            }),

            // Popular quizzes (top 10 by visits)
            prisma.quiz.findMany({
                where: {
                    status: 1
                },
                include: {
                    user: {
                        select: {
                            username: true,
                            title: true
                        }
                    }
                },
                orderBy: {
                    visits: 'desc'
                },
                take: 10
            })
        ])

        // Get total visits from quiz visits field as fallback
        const quizVisitsSum = await prisma.quiz.aggregate({
            _sum: {
                visits: true
            },
            where: {
                status: 1
            }
        })

        const actualTotalVisits = totalVisits > 0 ? totalVisits : (quizVisitsSum._sum.visits || 0)

        const dashboardData = {
            totalQuizzes,
            totalUsers,
            totalVisits: actualTotalVisits,
            recentQuizzes: recentQuizzes.map(quiz => ({
                id: quiz.id,
                title: quiz.title,
                status: quiz.status,
                quizType: quiz.quizType,
                visits: quiz.visits,
                createDate: quiz.createDate.toISOString(),
                username: quiz.username,
                user: quiz.user
            })),
            popularQuizzes: popularQuizzes.map(quiz => ({
                id: quiz.id,
                title: quiz.title,
                status: quiz.status,
                quizType: quiz.quizType,
                visits: quiz.visits,
                createDate: quiz.createDate.toISOString(),
                username: quiz.username,
                user: quiz.user
            }))
        }

        return NextResponse.json(dashboardData)

    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}