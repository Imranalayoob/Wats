import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import StatsCard from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Video, 
  Eye, 
  TrendingUp, 
  Calendar,
  Clock,
  Target,
  Activity
} from "lucide-react";
import type { Member, Video as VideoType } from "@shared/schema";

export default function Analytics() {
  const { data: overallStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/overview"],
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["/api/members"],
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["/api/videos"],
  });

  const { data: interactions, isLoading: interactionsLoading } = useQuery({
    queryKey: ["/api/interactions"],
  });

  // Calculate advanced analytics
  const analytics = {
    memberStats: Array.isArray(members) ? members.reduce((acc: any, member: Member) => {
      acc.byStatus[member.status] = (acc.byStatus[member.status] || 0) + 1;
      acc.totalEngagement += member.engagementRate;
      acc.activeMembers += member.status === 'active' ? 1 : 0;
      return acc;
    }, { byStatus: {}, totalEngagement: 0, activeMembers: 0 }) : { byStatus: {}, totalEngagement: 0, activeMembers: 0 },

    videoStats: Array.isArray(videos) ? videos.reduce((acc: any, video: VideoType) => {
      acc.totalClicks += video.clickCount;
      acc.totalSent += video.sentToMembers;
      
      // Track by date
      const date = new Date(video.createdAt).toDateString();
      acc.byDate[date] = (acc.byDate[date] || 0) + 1;
      
      return acc;
    }, { totalClicks: 0, totalSent: 0, byDate: {} }) : { totalClicks: 0, totalSent: 0, byDate: {} },

    topMembers: Array.isArray(members) ? members.filter((m: Member) => m.status === 'active')
      .sort((a: Member, b: Member) => b.totalVideos - a.totalVideos)
      .slice(0, 10) : [],

    engagementTrends: Array.isArray(members) ? members.filter((m: Member) => m.engagementRate > 0)
      .sort((a: Member, b: Member) => b.engagementRate - a.engagementRate) : []
  };

  const getEngagementLevel = (rate: number) => {
    if (rate >= 80) return { label: "ممتاز", color: "text-green-600", bg: "bg-green-100" };
    if (rate >= 60) return { label: "جيد", color: "text-blue-600", bg: "bg-blue-100" };
    if (rate >= 40) return { label: "متوسط", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { label: "ضعيف", color: "text-red-600", bg: "bg-red-100" };
  };

  if (statsLoading || membersLoading || videosLoading) {
    return (
      <div className="space-y-6">
        <Header title="التفاعل والإحصائيات" />
        <main className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="التفاعل والإحصائيات" subtitle="تحليل شامل لأداء المجموعة والأعضاء" />
      
      <main className="p-6 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="إجمالي الأعضاء"
            value={overallStats?.totalMembers || 0}
            icon={Users}
          />
          
          <StatsCard
            title="معدل النشاط اليومي"
            value={`${Math.round((overallStats?.activeToday / overallStats?.totalMembers) * 100) || 0}%`}
            icon={Activity}
          />
          
          <StatsCard
            title="متوسط التفاعل"
            value={`${Math.round(analytics.memberStats.totalEngagement / (members?.length || 1)) || 0}%`}
            icon={TrendingUp}
          />
          
          <StatsCard
            title="نسبة النقر على الروابط"
            value={`${Math.round((analytics.videoStats.totalClicks / analytics.videoStats.totalSent) * 100) || 0}%`}
            icon={Target}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Member Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                توزيع حالات الأعضاء
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">أعضاء نشطين</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 arabic-numbers">
                      {analytics.memberStats.byStatus.active || 0}
                    </span>
                    <Badge className="bg-green-100 text-green-800">
                      {Math.round(((analytics.memberStats.byStatus.active || 0) / (members?.length || 1)) * 100)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={((analytics.memberStats.byStatus.active || 0) / (members?.length || 1)) * 100} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">أعضاء بتحذير</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 arabic-numbers">
                      {analytics.memberStats.byStatus.warning || 0}
                    </span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {Math.round(((analytics.memberStats.byStatus.warning || 0) / (members?.length || 1)) * 100)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={((analytics.memberStats.byStatus.warning || 0) / (members?.length || 1)) * 100} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">أعضاء موقوفين</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 arabic-numbers">
                      {analytics.memberStats.byStatus.suspended || 0}
                    </span>
                    <Badge className="bg-red-100 text-red-800">
                      {Math.round(((analytics.memberStats.byStatus.suspended || 0) / (members?.length || 1)) * 100)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={((analytics.memberStats.byStatus.suspended || 0) / (members?.length || 1)) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                أفضل الأعضاء أداءً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topMembers.slice(0, 8).map((member: Member, index: number) => {
                  const engagement = getEngagementLevel(member.engagementRate);
                  return (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-100 text-yellow-600' :
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                          index === 2 ? 'bg-orange-100 text-orange-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.nickname}</p>
                          <p className="text-xs text-gray-500 arabic-numbers">
                            {member.totalVideos} فيديو
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge className={`${engagement.bg} ${engagement.color} text-xs`}>
                          {engagement.label}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1 arabic-numbers">
                          {member.engagementRate}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>التحليل التفصيلي</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="engagement" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="engagement">تحليل التفاعل</TabsTrigger>
                <TabsTrigger value="videos">إحصائيات الفيديوهات</TabsTrigger>
                <TabsTrigger value="performance">أداء الأعضاء</TabsTrigger>
              </TabsList>

              <TabsContent value="engagement" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 arabic-numbers">
                          {analytics.engagementTrends.filter((m: Member) => m.engagementRate >= 80).length}
                        </div>
                        <p className="text-sm text-gray-600">أعضاء بتفاعل ممتاز</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600 arabic-numbers">
                          {analytics.engagementTrends.filter((m: Member) => m.engagementRate >= 40 && m.engagementRate < 80).length}
                        </div>
                        <p className="text-sm text-gray-600">أعضاء بتفاعل متوسط</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 arabic-numbers">
                          {analytics.engagementTrends.filter((m: Member) => m.engagementRate < 40).length}
                        </div>
                        <p className="text-sm text-gray-600">أعضاء بتفاعل ضعيف</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="videos" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">إحصائيات الفيديوهات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>إجمالي الفيديوهات:</span>
                        <span className="font-bold arabic-numbers">{videos?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>إجمالي المشاهدات:</span>
                        <span className="font-bold arabic-numbers">{analytics.videoStats.totalClicks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>إجمالي الإرسالات:</span>
                        <span className="font-bold arabic-numbers">{analytics.videoStats.totalSent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>متوسط المشاهدات لكل فيديو:</span>
                        <span className="font-bold arabic-numbers">
                          {Math.round(analytics.videoStats.totalClicks / (videos?.length || 1))}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">معدلات الأداء</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>نسبة النقر على الروابط:</span>
                          <span className="font-bold text-blue-600 arabic-numbers">
                            {Math.round((analytics.videoStats.totalClicks / analytics.videoStats.totalSent) * 100) || 0}%
                          </span>
                        </div>
                        <Progress value={(analytics.videoStats.totalClicks / analytics.videoStats.totalSent) * 100 || 0} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>معدل المشاركة النشطة:</span>
                          <span className="font-bold text-green-600 arabic-numbers">
                            {Math.round((analytics.memberStats.activeMembers / (members?.length || 1)) * 100)}%
                          </span>
                        </div>
                        <Progress value={(analytics.memberStats.activeMembers / (members?.length || 1)) * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">ترتيب الأعضاء حسب الأداء</h3>
                  <div className="grid gap-4">
                    {analytics.engagementTrends.slice(0, 15).map((member: Member, index: number) => {
                      const engagement = getEngagementLevel(member.engagementRate);
                      return (
                        <Card key={member.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-lg font-bold text-gray-500 arabic-numbers">
                                  #{index + 1}
                                </div>
                                <div>
                                  <p className="font-medium">{member.nickname}</p>
                                  <p className="text-sm text-gray-500">
                                    {member.totalVideos} فيديو • {member.totalInteractions} تفاعل
                                  </p>
                                </div>
                              </div>
                              <div className="text-left">
                                <Badge className={`${engagement.bg} ${engagement.color}`}>
                                  {engagement.label}
                                </Badge>
                                <p className="text-sm font-bold mt-1 arabic-numbers">
                                  {member.engagementRate}%
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
