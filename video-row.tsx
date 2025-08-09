import { ExternalLink, Eye, Share2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Video } from "@shared/schema";

interface VideoRowProps {
  video: Video;
  memberNickname?: string;
}

export default function VideoRow({ video, memberNickname }: VideoRowProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getThumbnail = (url: string) => {
    // Simple thumbnail extraction for common platforms
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    }
    return null;
  };

  const thumbnail = getThumbnail(video.originalUrl);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            {thumbnail ? (
              <img 
                src={thumbnail} 
                alt="صورة مصغرة للفيديو"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {video.title || "فيديو بدون عنوان"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  من: {memberNickname || "عضو محذوف"}
                </p>
              </div>
              <Badge variant="secondary" className="flex-shrink-0">
                <Calendar className="w-3 h-3 ml-1" />
                {formatDate(video.createdAt)}
              </Badge>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span className="arabic-numbers">{video.clickCount}</span>
                <span>مشاهدة</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                <span className="arabic-numbers">{video.sentToMembers}</span>
                <span>مرسل</span>
              </div>
            </div>

            {/* URLs */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 min-w-fit">الرابط المختصر:</span>
                <a 
                  href={video.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 truncate"
                >
                  {video.shortUrl}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 min-w-fit">الرابط الأصلي:</span>
                <a 
                  href={video.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 truncate flex items-center gap-1"
                >
                  <span>{video.originalUrl}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
