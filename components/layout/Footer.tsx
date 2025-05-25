import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t bg-muted/50">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">فيس كويز</h3>
                        <p className="text-sm text-muted-foreground">
                            اكتشف شخصيتك واختبر معلوماتك مع مجموعة متنوعة من الاختبارات والألغاز الممتعة
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">روابط سريعة</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/category/personality" className="text-muted-foreground hover:text-primary">اختبارات الشخصية</Link></li>
                            <li><Link href="/category/knowledge" className="text-muted-foreground hover:text-primary">اختبارات المعرفة</Link></li>
                            <li><Link href="/category/puzzle" className="text-muted-foreground hover:text-primary">الألغاز</Link></li>
                            <li><Link href="/popular" className="text-muted-foreground hover:text-primary">الأكثر شعبية</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">الدعم</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/contact" className="text-muted-foreground hover:text-primary">اتصل بنا</Link></li>
                            <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">سياسة الخصوصية</Link></li>
                            <li><Link href="/terms" className="text-muted-foreground hover:text-primary">شروط الاستخدام</Link></li>
                            <li><Link href="/help" className="text-muted-foreground hover:text-primary">المساعدة</Link></li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">تابعنا</h4>
                        <div className="flex space-x-4 space-x-reverse">
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <Facebook className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <Mail className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; 2024 فيس كويز. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </footer>
    );
}