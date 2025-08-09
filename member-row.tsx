import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, MessageSquare, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Member } from "@shared/schema";

interface MemberRowProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  onSendMessage?: (member: Member) => void;
}

export default function MemberRow({ member, onEdit, onDelete, onSendMessage }: MemberRowProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/members/${id}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: "تم قبول العضو",
        description: "تم تفعيل العضوية وإرسال إشعار للعضو",
      });
    },
    onError: () => {
      toast({
        title: "فشل في قبول العضو",
        description: "حدث خطأ أثناء قبول العضو",
        variant: "destructive",
      });
    },
  });

  const rejectMemberMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await apiRequest("POST", `/api/members/${id}/reject`, { reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: "تم رفض العضو",
        description: "تم إرسال إشعار الرفض للعضو",
      });
    },
    onError: () => {
      toast({
        title: "فشل في رفض العضو",
        description: "حدث خطأ أثناء رفض العضو",
        variant: "destructive",
      });
    },
  });
  const formatDate = (date: Date | null) => {
    if (!date) return "غير متوفر";
    return new Date(date).toLocaleDateString('ar-EG');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200",
      warning: "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200",
      suspended: "bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200",
      pending: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      awaiting_approval: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };

    const labels = {
      active: "نشط",
      warning: "تحذير", 
      suspended: "موقوف",
      pending: "قيد الانتظار",
      awaiting_approval: "ينتظر الموافقة",
      inactive: "غير نشط"
    };

    return (
      <Badge className={cn("text-xs", variants[status as keyof typeof variants])}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 80) return "text-success-600";
    if (rate >= 50) return "text-warning-600";
    return "text-error-600";
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return "bg-success-500";
    if (rate >= 50) return "bg-warning-500";
    return "bg-error-500";
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.nickname}`} />
            <AvatarFallback className="text-xs">
              {member.nickname.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {member.phone}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              #{member.id.slice(-6)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900 dark:text-white font-medium">
          {member.nickname}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formatDate(member.joinedAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium arabic-numbers">
            {member.dailyVideosCount}
          </span>
          <span className="text-xs text-gray-500">/ 3</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-20">
            <Progress 
              value={member.engagementRate} 
              className="h-2"
            />
          </div>
          <span className={cn(
            "text-sm font-medium arabic-numbers",
            getEngagementColor(member.engagementRate)
          )}>
            {member.engagementRate}%
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(member.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {/* Approval buttons for awaiting approval status */}
          {member.status === 'awaiting_approval' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50 h-8 px-2"
                onClick={() => approveMemberMutation.mutate(member.id)}
                disabled={approveMemberMutation.isPending}
                data-testid={`button-approve-${member.id}`}
              >
                <Check className="w-3 h-3 ml-1" />
                قبول
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50 h-8 px-2"
                onClick={() => rejectMemberMutation.mutate({ id: member.id, reason: 'تم رفض الطلب من الإدارة' })}
                disabled={rejectMemberMutation.isPending}
                data-testid={`button-reject-${member.id}`}
              >
                <X className="w-3 h-3 ml-1" />
                رفض
              </Button>
            </>
          )}
          
          {/* Pending indicator */}
          {member.status === 'pending' && (
            <div className="flex items-center gap-1 text-blue-600 text-sm">
              <Clock className="w-3 h-3" />
              <span>ينتظر القبول</span>
            </div>
          )}
          
          {/* Regular actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" data-testid={`button-actions-${member.id}`}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(member)}>
                <Edit className="w-4 h-4 ml-2" />
                تعديل البيانات
              </DropdownMenuItem>
              {onSendMessage && (
                <DropdownMenuItem onClick={() => onSendMessage(member)}>
                  <MessageSquare className="w-4 h-4 ml-2" />
                  إرسال رسالة
                </DropdownMenuItem>
              )}
              {member.status !== 'active' && member.status !== 'awaiting_approval' && (
                <DropdownMenuItem onClick={() => approveMemberMutation.mutate(member.id)}>
                  <Check className="w-4 h-4 ml-2" />
                  تفعيل العضو
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(member)}
                className="text-error-600 focus:text-error-600"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف العضو
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
