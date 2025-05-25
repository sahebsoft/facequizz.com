'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    BarChart3,
    Users,
    FileText,
    Plus,
    Edit,
    Eye,
    TrendingUp,
    Calendar,
    Activity
} from 'lucide-react'

interface DashboardStats {
    totalQuizzes: number
    totalUsers: number
    totalVisits: number
    recentQuizzes: Quiz[]
    popularQuizzes: Quiz[]
}

interface Quiz {
    id: number
    title: string
    status: number
    quizType: number
    visits: number
    createDate: string
    username: string
    user?: {
        title?: string
    }
}

export default function AdminDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (status === 'loading') return

        if (!session || session.user.userType !== 'a') {
            router.push('/auth/login')
            return
        }

        fetchDashboardData()
    }, [session, status, router])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/dashboard')

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data')
            }

            const data = await response.json()
            setStats(data)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            setError('حدث خطأ في تحميل بيانات لوحة التحكم')
        } finally {
            setLoading(false)
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!session || session.user.userType !== 'a') {
        return null
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    const getQuizTypeLabel = (type: number) => {
        switch (type) {
            case 1: return 'شخصية'
            case 2: return 'معرفة'
            case 3: return 'لغز'
            default: return 'غير محدد'
        }
    }

    const getStatusBadge = (status: number) => {
        if (status === 1) {
            return <Badge className="bg-green-100 text-green-800">منشور</Badge>
        }
        return <Badge variant="secondary">مسودة</Badge>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">لوحة التحكم</h1>
                    <p className="text-muted-foreground">
                        مرحباً {session.user.title || session.user.username}
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/quiz/new" className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        اختبار جديد
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الاختبارات</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalQuizzes || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الزيارات</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalVisits?.toLocaleString() || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="recent" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="recent">الاختبارات الأخيرة</TabsTrigger>
                    <TabsTrigger value="popular">الأكثر شعبية</TabsTrigger>
                    <TabsTrigger value="analytics">التحليلات</TabsTrigger>
                </TabsList>

                <TabsContent value="recent">
                    <Card>
                        <CardHeader>
                            <CardTitle>الاختبارات الأخيرة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats?.recentQuizzes?.length ? (
                                    stats.recentQuizzes.map((quiz) => (
                                        <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-1">
                                                <h3 className="font-medium">{quiz.title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Badge variant="outline">{getQuizTypeLabel(quiz.quizType)}</Badge>
                                                    {getStatusBadge(quiz.status)}
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        {quiz.visits}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(quiz.createDate).toLocaleDateString('ar-EG')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/quiz/${quiz.id}`}>
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/admin/quiz/${quiz.id}/edit`}>
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        لا توجد اختبارات متاحة
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="popular">
                    <Card>
                        <CardHeader>
                            <CardTitle>الاختبارات الأكثر شعبية</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats?.popularQuizzes?.length ? (
                                    stats.popularQuizzes.map((quiz, index) => (
                                        <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                                    {index + 1}
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-medium">{quiz.title}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Badge variant="outline">{getQuizTypeLabel(quiz.quizType)}</Badge>
                                                        <span className="flex items-center gap-1">
                                                            <TrendingUp className="w-3 h-3" />
                                                            {quiz.visits.toLocaleString()} زيارة
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/quiz/${quiz.id}`}>
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/admin/quiz/${quiz.id}/edit`}>
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        لا توجد اختبارات متاحة
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    إحصائيات سريعة
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>معدل الزيارات اليومية</span>
                                    <span className="font-bold">{Math.round((stats?.totalVisits || 0) / 30)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>متوسط الزيارات لكل اختبار</span>
                                    <span className="font-bold">
                                        {stats?.totalQuizzes ? Math.round((stats?.totalVisits || 0) / stats.totalQuizzes) : 0}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>اختبارات الشخصية</span>
                                    <span className="font-bold">
                                        {stats?.recentQuizzes?.filter(q => q.quizType === 1).length || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>اختبارات المعرفة</span>
                                    <span className="font-bold">
                                        {stats?.recentQuizzes?.filter(q => q.quizType === 2).length || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>الألغاز</span>
                                    <span className="font-bold">
                                        {stats?.recentQuizzes?.filter(q => q.quizType === 3).length || 0}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    إجراءات سريعة
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button asChild className="w-full justify-start" variant="outline">
                                    <Link href="/admin/quiz/new">
                                        <Plus className="w-4 h-4 mr-2" />
                                        إنشاء اختبار جديد
                                    </Link>
                                </Button>
                                <Button asChild className="w-full justify-start" variant="outline">
                                    <Link href="/admin/quizzes">
                                        <FileText className="w-4 h-4 mr-2" />
                                        إدارة الاختبارات
                                    </Link>
                                </Button>
                                <Button asChild className="w-full justify-start" variant="outline">
                                    <Link href="/admin/users">
                                        <Users className="w-4 h-4 mr-2" />
                                        إدارة المستخدمين
                                    </Link>
                                </Button>
                                <Button asChild className="w-full justify-start" variant="outline">
                                    <Link href="/admin/analytics">
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        التحليلات التفصيلية
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}