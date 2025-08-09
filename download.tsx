import { useState } from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, FileArchive, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DownloadPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateZip = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/download/generate-zip', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('فشل في توليد الملف');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      toast({
        title: "تم إنشاء الملف بنجاح",
        description: "يمكنك الآن تحميل جميع ملفات البوت",
      });
    } catch (error) {
      toast({
        title: "خطأ في إنشاء الملف",
        description: "حدث خطأ أثناء توليد ملف ZIP",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `whatsapp-bot-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "تم بدء التحميل",
        description: "ملف البوت جاهز في مجلد التحميلات",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Header 
        title="تحميل ملفات البوت" 
        subtitle="تحميل جميع ملفات المشروع كملف مضغوط"
      />
      
      <main className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileArchive className="w-5 h-5" />
              تحميل المشروع كاملاً
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                سيتم تحميل جميع ملفات البوت بما في ذلك الكود المصدري، 
                إعدادات قاعدة البيانات، وملفات التكوين. يمكنك استخدام هذه الملفات 
                للتعديل أو النسخ الاحتياطي أو مشاركتها مع مطورين آخرين.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h3 className="font-medium mb-2">محتويات الملف المضغوط:</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• جميع ملفات الكود المصدري (TypeScript/JavaScript)</li>
                  <li>• ملفات التكوين (package.json, vite.config.ts, etc.)</li>
                  <li>• مخططات قاعدة البيانات (Drizzle schemas)</li>
                  <li>• ملفات واجهة المستخدم (React components)</li>
                  <li>• إعدادات البوت وخدمات WhatsApp</li>
                  <li>• ملف README مع تعليمات التشغيل</li>
                </ul>
              </div>

              <div className="flex gap-4">
                {!downloadUrl ? (
                  <Button
                    onClick={handleGenerateZip}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-generate-zip"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري إنشاء الملف...
                      </>
                    ) : (
                      <>
                        <FileArchive className="w-4 h-4 ml-2" />
                        إنشاء ملف ZIP
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleDownload}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-download-zip"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تحميل الملف
                  </Button>
                )}
              </div>

              {downloadUrl && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    تم إنشاء الملف بنجاح! اضغط على "تحميل الملف" لحفظه على جهازك.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات مهمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">تنبيه:</p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  تأكد من حفظ متغيرات البيئة (Environment Variables) منفصلة، 
                  حيث أنها لا يتم تضمينها في الملف المضغوط لأسباب أمنية.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <p className="font-medium text-blue-800 dark:text-blue-200">نصيحة:</p>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  احتفظ بنسخة من هذا الملف في مكان آمن كنسخة احتياطية من مشروعك.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}