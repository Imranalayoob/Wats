import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import StatsCard from "@/components/stats-card";
import MemberRow from "@/components/member-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  UserCheck, 
  Video, 
  Heart,
  UserPlus,
  AlertTriangle,
  Trophy,
  Plus,
  Radio,
  FileText,
  Shield
} from "lucide-react";
import type { Member } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/overview"],
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["/api/members"],
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/logs"],
  });

  if (statsLoading || membersLoading) {
    return (
      <div className="space-y-6">
        <Header title="لوحة المعلومات" />
        <main className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  const recentMembers = Array.isArray(members) ? members.slice(0, 3) : [];
  const topMembers = Array.isArray(members) 
    ? members
        .filter((m: Member) => m.status === 'active')
        .sort((a: Member, b: Member) => b.engagementRate - a.engagementRate)
        .slice(0, 3)
    : [];

  return (
    <div className="space-y-6">
      <Header title="لوحة المعلومات" />
      
      <main className="p-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="إجمالي الأعضاء"
            value={(stats as any)?.totalMembers || 0}
            icon={Users}
            change={{
              value: "+12%",
              trend: "up",
              period: "من الأسبوع الماضي"
            }}
          />
          
          <StatsCard
            title="الأعضاء النشطين اليوم"
            value={(stats as any)?.activeToday || 0}
            icon={UserCheck}
            change={{
              value: "+8%",
              trend: "up",
              period: "من أمس"
            }}
          />
          
          <StatsCard
            title="الفيديوهات المشاركة اليوم"
            value={(stats as any)?.videosToday || 0}
            icon={Video}
            change={{
              value: "-3%",
              trend: "down",
              period: "من أمس"
            }}
          />
          
          <StatsCard
            title="معدل التفاعل"
            value={`${(stats as any)?.engagementRate || 0}%`}
            icon={Heart}
            change={{
              value: "+5%",
              trend: "up",
              period: "من الأسبوع الماضي"
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>النشاط الأخير</CardTitle>
                  <Button variant="ghost" size="sm">
                    عرض الكل
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {logsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))
                ) : logs && logs.length > 0 ? (
                  logs.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        {log.type === 'message_sent' && <Radio className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
                        {log.type === 'message_received' && <Video className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
                        {log.type === 'member_joined' && <UserPlus className="w-5 h-5 text-success-600" />}
                        {log.type === 'error' && <AlertTriangle className="w-5 h-5 text-error-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 dark:text-gray-200 text-sm">
                          {log.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(log.createdAt).toLocaleString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد أنشطة حديثة
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Top Members */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-3" variant="outline">
                  <UserPlus className="w-4 h-4" />
                  إضافة عضو جديد
                </Button>
                <Button className="w-full justify-start gap-3" variant="outline">
                  <Radio className="w-4 h-4" />
                  إرسال رسالة جماعية
                </Button>
                <Button className="w-full justify-start gap-3" variant="outline">
                  <FileText className="w-4 h-4" />
                  تصدير تقرير يومي
                </Button>
                <Button className="w-full justify-start gap-3" variant="outline">
                  <Shield className="w-4 h-4" />
                  إعادة تشغيل البوت
                </Button>
              </CardContent>
            </Card>

            {/* Top Members */}
            <Card>
              <CardHeader>
                <CardTitle>أفضل الأعضاء هذا الأسبوع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topMembers.length > 0 ? (
                  topMembers.map((member: Member, index: number) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        index === 1 ? 'bg-gray-100 dark:bg-gray-800' :
                        'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        <span className={`font-bold text-sm ${
                          index === 0 ? 'text-yellow-600 dark:text-yellow-400' :
                          index === 1 ? 'text-gray-600 dark:text-gray-400' :
                          'text-orange-600 dark:text-orange-400'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-white text-sm">
                          {member.nickname}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {member.totalVideos} فيديو
                        </p>
                      </div>
                      <div className="text-success-600 dark:text-success-400 text-sm font-medium arabic-numbers">
                        {member.engagementRate}%
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    لا توجد بيانات أعضاء
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Members Preview */}
        {recentMembers.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>الأعضاء الجدد</CardTitle>
                <Button variant="ghost" size="sm">
                  عرض الكل
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        العضو
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        الاسم المستعار
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        تاريخ الانضمام
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        الحالة
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentMembers.map((member: Member) => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
