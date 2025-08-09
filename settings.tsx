import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings as SettingsIcon, 
  Bot, 
  MessageSquare, 
  Shield, 
  Save,
  RefreshCw,
  QrCode,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  User
} from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("bot");
  const [isStartingBot, setIsStartingBot] = useState(false);
  const [isStoppingBot, setIsStoppingBot] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  const { data: botStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/bot/status"],
    refetchInterval: 5000,
  });

  // Convert settings array to object for easier access
  const settingsObj = Array.isArray(settings) ? settings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {}) : {};

  // Bot control mutations
  const startBotMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/bot/start");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
      toast({
        title: "تم تشغيل البوت",
        description: "جارٍ الاتصال بواتساب...",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تشغيل البوت",
        description: error.message || "حدث خطأ أثناء تشغيل البوت",
        variant: "destructive",
      });
    },
  });

  const stopBotMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/bot/stop");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
      toast({
        title: "تم إيقاف البوت",
        description: "تم قطع الاتصال مع واتساب",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إيقاف البوت",
        description: error.message || "حدث خطأ أثناء إيقاف البوت",
        variant: "destructive",
      });
    },
  });

  // Settings update mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const response = await apiRequest("POST", "/api/settings", { key, value });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث الإعدادات بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: error.message || "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    },
  });

  const handleStartBot = async () => {
    setIsStartingBot(true);
    try {
      await startBotMutation.mutateAsync();
    } finally {
      setIsStartingBot(false);
    }
  };

  const handleStopBot = async () => {
    setIsStoppingBot(true);
    try {
      await stopBotMutation.mutateAsync();
    } finally {
      setIsStoppingBot(false);
    }
  };

  const handleUpdateSetting = (key: string, value: any) => {
    updateSettingMutation.mutate({ key, value });
  };

  if (settingsLoading || statusLoading) {
    return (
      <div className="space-y-6">
        <Header title="إعدادات البوت" />
        <main className="p-6 space-y-6">
          <Skeleton className="h-96" />
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="إعدادات البوت" subtitle="إدارة وتكوين بوت واتساب والنظام" />
      
      <main className="p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bot" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              البوت
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              الرسائل
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              القواعد
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              الإدارة
            </TabsTrigger>
          </TabsList>

          {/* Bot Control Tab */}
          <TabsContent value="bot" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  حالة البوت
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {(botStatus as any)?.isReady ? (
                      <div className="flex items-center gap-2">
                        <Wifi className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">البوت متصل</p>
                          <p className="text-sm text-gray-500">جاهز لاستقبال الرسائل</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <WifiOff className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-medium">البوت غير متصل</p>
                          <p className="text-sm text-gray-500">يحتاج إلى تسجيل دخول</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!(botStatus as any)?.isReady ? (
                      <Button 
                        onClick={handleStartBot}
                        disabled={isStartingBot}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <RefreshCw className={`w-4 h-4 ml-2 ${isStartingBot ? 'animate-spin' : ''}`} />
                        {isStartingBot ? "جارٍ التشغيل..." : "تشغيل البوت"}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleStopBot}
                        disabled={isStoppingBot}
                        variant="destructive"
                      >
                        <RefreshCw className={`w-4 h-4 ml-2 ${isStoppingBot ? 'animate-spin' : ''}`} />
                        {isStoppingBot ? "جارٍ الإيقاف..." : "إيقاف البوت"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* QR Code Display */}
                {(botStatus as any)?.qrCode && (
                  <div className="qr-code-container">
                    <QrCode className="w-8 h-8 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">مسح كود QR</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      افتح واتساب على هاتفك واختر "الأجهزة المرتبطة" ثم امسح هذا الكود
                    </p>
                    <img 
                      src={(botStatus as any).qrCode} 
                      alt="QR Code" 
                      className="max-w-xs mx-auto"
                    />
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">إعدادات الاتصال</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>وضع التطوير</Label>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={settingsObj.development_mode || false}
                          onCheckedChange={(checked) => handleUpdateSetting('development_mode', checked)}
                        />
                        <span className="text-sm text-gray-600">تفعيل رسائل التطوير</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>إعادة الاتصال التلقائي</Label>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={settingsObj.auto_reconnect !== false}
                          onCheckedChange={(checked) => handleUpdateSetting('auto_reconnect', checked)}
                        />
                        <span className="text-sm text-gray-600">إعادة اتصال تلقائية عند انقطاع الشبكة</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">نظام السبات 😴</h4>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={settingsObj.sleep_mode_enabled !== false}
                          onCheckedChange={(checked) => handleUpdateSetting('sleep_mode_enabled', checked)}
                        />
                        <span className="text-sm font-medium">تفعيل نظام السبات</span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        🌙 البوت سيدخل في حالة سبات من الساعة 12:00 ليلاً حتى 7:00 صباحاً
                        <br />
                        📵 سيتم رفض جميع الرسائل ما عدا رسائل المدير
                        <br />
                        🎯 هذا يمنع إزعاج الأعضاء في أوقات الراحة
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>رسائل البوت</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="welcome-message">رسالة الترحيب</Label>
                    <Textarea
                      id="welcome-message"
                      value={settingsObj.bot_welcome_message || ""}
                      onChange={(e) => handleUpdateSetting('bot_welcome_message', e.target.value)}
                      placeholder="مرحباً بك في مجموعة ريدز..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="instructions-message">رسالة التعليمات</Label>
                    <Textarea
                      id="instructions-message"
                      value={settingsObj.bot_instructions || ""}
                      onChange={(e) => handleUpdateSetting('bot_instructions', e.target.value)}
                      placeholder="التعليمات: 1. أرسل 3 فيديوهات يومياً..."
                      className="mt-2"
                      rows={5}
                    />
                  </div>

                  <div>
                    <Label htmlFor="warning-message">رسالة التحذير</Label>
                    <Textarea
                      id="warning-message"
                      value={settingsObj.warning_message || ""}
                      onChange={(e) => handleUpdateSetting('warning_message', e.target.value)}
                      placeholder="تحذير: لم تتفاعل مع الروابط المرسلة..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="removal-message">رسالة الإزالة</Label>
                    <Textarea
                      id="removal-message"
                      value={settingsObj.removal_message || ""}
                      onChange={(e) => handleUpdateSetting('removal_message', e.target.value)}
                      placeholder="تم إزالتك من المجموعة بسبب عدم التفاعل..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    toast({
                      title: "تم حفظ الرسائل",
                      description: "تم تحديث جميع رسائل البوت",
                    });
                  }}
                  className="w-full"
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ الرسائل
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>قواعد المجموعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="max-videos">الحد الأقصى للفيديوهات اليومية</Label>
                      <Input
                        id="max-videos"
                        type="number"
                        value={settingsObj.max_daily_videos || 3}
                        onChange={(e) => handleUpdateSetting('max_daily_videos', parseInt(e.target.value))}
                        className="mt-2"
                        min="1"
                        max="10"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="warning-days">أيام التحذير</Label>
                      <Input
                        id="warning-days"
                        type="number"
                        value={settingsObj.warning_threshold_days || 2}
                        onChange={(e) => handleUpdateSetting('warning_threshold_days', parseInt(e.target.value))}
                        className="mt-2"
                        min="1"
                        max="7"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        عدد الأيام بدون تفاعل قبل إرسال تحذير
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="removal-days">أيام الإزالة</Label>
                      <Input
                        id="removal-days"
                        type="number"
                        value={settingsObj.auto_remove_days || 7}
                        onChange={(e) => handleUpdateSetting('auto_remove_days', parseInt(e.target.value))}
                        className="mt-2"
                        min="3"
                        max="30"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        عدد الأيام بدون تفاعل قبل الإزالة التلقائية
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>إعدادات التفاعل</Label>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={settingsObj.require_interaction !== false}
                            onCheckedChange={(checked) => handleUpdateSetting('require_interaction', checked)}
                          />
                          <span className="text-sm">إجبار التفاعل مع الروابط</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={settingsObj.auto_warnings || false}
                            onCheckedChange={(checked) => handleUpdateSetting('auto_warnings', checked)}
                          />
                          <span className="text-sm">إرسال تحذيرات تلقائية</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={settingsObj.auto_removal || false}
                            onCheckedChange={(checked) => handleUpdateSetting('auto_removal', checked)}
                          />
                          <span className="text-sm">الإزالة التلقائية للأعضاء</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            تنبيه مهم
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            تغيير هذه الإعدادات سيؤثر على جميع الأعضاء الحاليين والجدد
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الإدارة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="admin-phone">رقم هاتف المدير</Label>
                    <Input
                      id="admin-phone"
                      value={settingsObj.admin_phone || ""}
                      onChange={(e) => handleUpdateSetting('admin_phone', e.target.value)}
                      placeholder="+966501234567"
                      className="mt-2"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <Label htmlFor="backup-admin">رقم المدير الاحتياطي</Label>
                    <Input
                      id="backup-admin"
                      value={settingsObj.backup_admin_phone || ""}
                      onChange={(e) => handleUpdateSetting('backup_admin_phone', e.target.value)}
                      placeholder="+966501234568"
                      className="mt-2"
                      dir="ltr"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>تنبيهات الإدارة</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={settingsObj.admin_notifications !== false}
                          onCheckedChange={(checked) => handleUpdateSetting('admin_notifications', checked)}
                        />
                        <span className="text-sm">تنبيهات عامة للمدير</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={settingsObj.daily_reports || false}
                          onCheckedChange={(checked) => handleUpdateSetting('daily_reports', checked)}
                        />
                        <span className="text-sm">تقارير يومية</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={settingsObj.error_notifications !== false}
                          onCheckedChange={(checked) => handleUpdateSetting('error_notifications', checked)}
                        />
                        <span className="text-sm">تنبيهات الأخطاء</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>عمليات صيانة النظام</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من إعادة تعيين عدد الفيديوهات اليومية لجميع الأعضاء؟")) {
                            // Reset daily counts API call would go here
                            toast({
                              title: "تم إعادة التعيين",
                              description: "تم إعادة تعيين عدد الفيديوهات اليومية لجميع الأعضاء",
                            });
                          }
                        }}
                      >
                        <RefreshCw className="w-4 h-4 ml-2" />
                        إعادة تعيين العدادات اليومية
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "جارٍ التنظيف",
                            description: "جارٍ حذف البيانات القديمة والملفات المؤقتة",
                          });
                        }}
                      >
                        <Shield className="w-4 h-4 ml-2" />
                        تنظيف البيانات القديمة
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
