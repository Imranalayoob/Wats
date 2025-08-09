import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import VideoRow from "@/components/video-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, Video, TrendingUp, Eye, Share2, Download } from "lucide-react";
import type { Video as VideoType, Member } from "@shared/schema";

export default function Videos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [activeTab, setActiveTab] = useState("all");

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["/api/videos"],
  });

  const { data: todayVideos, isLoading: todayLoading } = useQuery({
    queryKey: ["/api/videos/today"],
  });

  const { data: members } = useQuery({
    queryKey: ["/api/members"],
  });

  const { data: urlStats } = useQuery({
    queryKey: ["/api/urls/stats"],
  });

  // Create member lookup for nicknames
  const memberLookup = Array.isArray(members) ? members.reduce((acc: Record<string, string>, member: Member) => {
    acc[member.id] = member.nickname;
    return acc;
  }, {}) : {};

  const filteredVideos = Array.isArray(videos) ? videos.filter((video: VideoType) => {
    const memberNickname = memberLookup[video.memberId] || "";
    const matchesSearch = 
      video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberNickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.originalUrl.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (dateFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return matchesSearch && new Date(video.createdAt) >= today;
    }
    
    return matchesSearch;
  }) : [];

  const videoStats = {
    total: Array.isArray(videos) ? videos.length : 0,
    today: Array.isArray(todayVideos) ? todayVideos.length : 0,
    totalClicks: Array.isArray(videos) ? videos.reduce((sum: number, video: VideoType) => sum + video.clickCount, 0) : 0,
    totalSent: Array.isArray(videos) ? videos.reduce((sum: number, video: VideoType) => sum + video.sentToMembers, 0) : 0,
  };

  return (
    <div className="space-y-6">
      <Header title="سجل الفيديوهات" subtitle="عرض وتتبع جميع الفيديوهات المشاركة" />
      
      <main className="p-6 space-y-6">
        {/* Video Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الفيديوهات</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white arabic-numbers">
                    {videoStats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <Video className="text-primary-600 dark:text-primary-400 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">فيديوهات اليوم</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white arabic-numbers">
                    {videoStats.today}
                  </p>
                </div>
                <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="text-success-600 dark:text-success-400 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المشاهدات</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white arabic-numbers">
                    {videoStats.totalClicks}
                  </p>
                </div>
                <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/30 rounded-lg flex items-center justify-center">
                  <Eye className="text-warning-600 dark:text-warning-400 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الإرسالات</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white arabic-numbers">
                    {videoStats.totalSent}
                  </p>
                </div>
                <div className="w-12 h-12 bg-error-100 dark:bg-error-900/30 rounded-lg flex items-center justify-center">
                  <Share2 className="text-error-600 dark:text-error-400 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث في الفيديوهات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التواريخ</SelectItem>
                    <SelectItem value="today">اليوم</SelectItem>
                    <SelectItem value="week">هذا الأسبوع</SelectItem>
                    <SelectItem value="month">هذا الشهر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 ml-2" />
                تصدير البيانات
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Videos Content */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b dark:border-gray-700">
                <TabsList className="grid w-full grid-cols-3 bg-transparent h-12">
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600">
                    جميع الفيديوهات
                    <Badge variant="secondary" className="mr-2">
                      {filteredVideos.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600">
                    الأكثر مشاهدة
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600">
                    الأحدث
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="p-6">
                {videosLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : filteredVideos.length > 0 ? (
                  <div className="space-y-4">
                    {filteredVideos.map((video: VideoType) => (
                      <VideoRow
                        key={video.id}
                        video={video}
                        memberNickname={memberLookup[video.memberId]}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      لا توجد فيديوهات
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm || dateFilter !== "all" 
                        ? "لا توجد نتائج للبحث المحدد"
                        : "لم يتم مشاركة أي فيديوهات بعد"
                      }
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trending" className="p-6">
                {videosLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredVideos
                      .sort((a: VideoType, b: VideoType) => b.clickCount - a.clickCount)
                      .slice(0, 10)
                      .map((video: VideoType) => (
                        <VideoRow
                          key={video.id}
                          video={video}
                          memberNickname={memberLookup[video.memberId]}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recent" className="p-6">
                {videosLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredVideos
                      .sort((a: VideoType, b: VideoType) => 
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      )
                      .slice(0, 20)
                      .map((video: VideoType) => (
                        <VideoRow
                          key={video.id}
                          video={video}
                          memberNickname={memberLookup[video.memberId]}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
