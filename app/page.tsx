import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuizCard } from '@/components/quiz/QuizCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TrendingUp, Star, Brain, Puzzle, BookOpen } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';

async function getFeaturedQuizzes() {
  return await prisma.quiz.findMany({
    where: {
      status: 1,
      starFlag: 1,
      divisionId: 1
    },
    include: {
      user: {
        select: {
          username: true,
          title: true
        }
      }
    },
    orderBy: { visits: 'desc' },
    take: 6
  });
}

async function getPopularQuizzes() {
  return await prisma.quiz.findMany({
    where: {
      status: 1,
      divisionId: 1
    },
    include: {
      user: {
        select: {
          username: true,
          title: true
        }
      }
    },
    orderBy: { visits: 'desc' },
    take: 12
  });
}

async function getQuizzesByType(type: number, limit: number = 6) {
  return await prisma.quiz.findMany({
    where: {
      status: 1,
      quizType: type,
      divisionId: 1
    },
    include: {
      user: {
        select: {
          username: true,
          title: true
        }
      }
    },
    orderBy: { createDate: 'desc' },
    take: limit
  });
}

export default async function HomePage() {
  const [featuredQuizzes, popularQuizzes, personalityQuizzes, knowledgeQuizzes, puzzleQuizzes] = await Promise.all([
    getFeaturedQuizzes(),
    getPopularQuizzes(),
    getQuizzesByType(1),
    getQuizzesByType(2),
    getQuizzesByType(3)
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            فيس كويز
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            اكتشف شخصيتك، اختبر معلوماتك، وحل الألغاز الشيقة مع مجموعة متنوعة من الاختبارات الممتعة
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-base p-3">
              <Brain className="w-5 h-5 mr-2" />
              اختبارات الشخصية
            </Badge>
            <Badge variant="secondary" className="text-base p-3">
              <BookOpen className="w-5 h-5 mr-2" />
              اختبارات المعرفة
            </Badge>
            <Badge variant="secondary" className="text-base p-3">
              <Puzzle className="w-5 h-5 mr-2" />
              الألغاز الذكية
            </Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Featured Quizzes */}
        {featuredQuizzes.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl md:text-3xl font-bold">الاختبارات المميزة</h2>
              </div>
              <Button asChild variant="outline">
                <Link href="/featured">عرض الكل</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Quizzes */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">الاختبارات الأكثر شعبية</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/popular">عرض الكل</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </section>

        {/* Quiz Categories */}
        <section className="space-y-12">
          {/* Personality Quizzes */}
          {personalityQuizzes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-purple-500" />
                  <h3 className="text-xl md:text-2xl font-bold">اختبارات الشخصية</h3>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/category/personality">عرض المزيد</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalityQuizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Quizzes */}
          {knowledgeQuizzes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl md:text-2xl font-bold">اختبارات المعرفة</h3>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/category/knowledge">عرض المزيد</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {knowledgeQuizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            </div>
          )}

          {/* Puzzle Quizzes */}
          {puzzleQuizzes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Puzzle className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl md:text-2xl font-bold">الألغاز</h3>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/category/puzzle">عرض المزيد</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {puzzleQuizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Stats Section */}
        <section className="bg-muted/50 rounded-lg p-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">إحصائيات الموقع</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Suspense fallback={<LoadingSpinner />}>
                <StatsCard />
              </Suspense>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

async function StatsCard() {
  const [totalQuizzes, totalVisits, totalUsers] = await Promise.all([
    prisma.quiz.count({ where: { status: 1 } }),
    prisma.visit.count(),
    prisma.user.count()
  ]);

  return (
    <>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-primary">{totalQuizzes.toLocaleString()}</p>
        <p className="text-muted-foreground">اختبار متاح</p>
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-primary">{totalVisits.toLocaleString()}</p>
        <p className="text-muted-foreground">مرة تم إجراء اختبار</p>
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-primary">{totalUsers.toLocaleString()}</p>
        <p className="text-muted-foreground">مستخدم مسجل</p>
      </div>
    </>
  );
}

