import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import MemberRow from "@/components/member-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Plus, UserPlus, Download } from "lucide-react";
import type { Member, InsertMember } from "@shared/schema";

export default function Members() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newMember, setNewMember] = useState<InsertMember>({
    phone: "",
    nickname: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["/api/members"],
  });

  const createMemberMutation = useMutation({
    mutationFn: async (memberData: InsertMember) => {
      const response = await apiRequest("POST", "/api/members", memberData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      setIsAddDialogOpen(false);
      setNewMember({ phone: "", nickname: "" });
      toast({
        title: "تم إضافة العضو بنجاح",
        description: "تم إرسال رسالة ترحيب للعضو الجديد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إضافة العضو",
        description: error.message || "حدث خطأ أثناء إضافة العضو",
        variant: "destructive",
      });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Member> }) => {
      const response = await apiRequest("PATCH", `/api/members/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      setIsEditDialogOpen(false);
      setSelectedMember(null);
      toast({
        title: "تم تحديث بيانات العضو",
        description: "تم حفظ التغييرات بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث البيانات",
        description: error.message || "حدث خطأ أثناء تحديث البيانات",
        variant: "destructive",
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/members/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: "تم حذف العضو",
        description: "تم حذف العضو من المجموعة نهائياً",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف العضو",
        description: error.message || "حدث خطأ أثناء حذف العضو",
        variant: "destructive",
      });
    },
  });

  const filteredMembers = Array.isArray(members) ? members.filter((member: Member) => {
    const matchesSearch = 
      member.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const handleAddMember = () => {
    if (!newMember.phone || !newMember.nickname) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال رقم الهاتف والاسم المستعار",
        variant: "destructive",
      });
      return;
    }
    createMemberMutation.mutate(newMember);
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const handleUpdateMember = () => {
    if (!selectedMember) return;
    updateMemberMutation.mutate({
      id: selectedMember.id,
      updates: {
        nickname: selectedMember.nickname,
        status: selectedMember.status
      }
    });
  };

  const handleDeleteMember = (member: Member) => {
    if (confirm(`هل أنت متأكد من حذف العضو "${member.nickname}"؟`)) {
      deleteMemberMutation.mutate(member.id);
    }
  };

  return (
    <div className="space-y-6">
      <Header title="إدارة الأعضاء" subtitle="عرض وإدارة جميع أعضاء المجموعة" />
      
      <main className="p-6 space-y-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث عن عضو..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="warning">تحذير</SelectItem>
                    <SelectItem value="suspended">موقوف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة عضو
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>إضافة عضو جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="phone">رقم الهاتف</Label>
                        <Input
                          id="phone"
                          placeholder="+966501234567"
                          value={newMember.phone}
                          onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nickname">الاسم المستعار</Label>
                        <Input
                          id="nickname"
                          placeholder="محمد_ريدز"
                          value={newMember.nickname}
                          onChange={(e) => setNewMember({ ...newMember, nickname: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          إلغاء
                        </Button>
                        <Button 
                          onClick={handleAddMember}
                          disabled={createMemberMutation.isPending}
                        >
                          {createMemberMutation.isPending ? "جارٍ الإضافة..." : "إضافة العضو"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Members Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <>
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
                          الفيديوهات اليوم
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          معدل التفاعل
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          الحالة
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map((member: Member) => (
                          <MemberRow
                            key={member.id}
                            member={member}
                            onEdit={handleEditMember}
                            onDelete={handleDeleteMember}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            {searchTerm || statusFilter !== "all" 
                              ? "لا توجد نتائج للبحث المحدد"
                              : "لا توجد أعضاء في المجموعة بعد"
                            }
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredMembers.length > 0 && (
                  <div className="px-6 py-4 border-t dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        عرض {filteredMembers.length} من {Array.isArray(members) ? members.length : 0} عضو
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Member Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل بيانات العضو</DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-nickname">الاسم المستعار</Label>
                  <Input
                    id="edit-nickname"
                    value={selectedMember.nickname}
                    onChange={(e) => setSelectedMember({ 
                      ...selectedMember, 
                      nickname: e.target.value 
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">حالة العضو</Label>
                  <Select 
                    value={selectedMember.status} 
                    onValueChange={(value) => setSelectedMember({ 
                      ...selectedMember, 
                      status: value as any 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="warning">تحذير</SelectItem>
                      <SelectItem value="suspended">موقوف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleUpdateMember}
                    disabled={updateMemberMutation.isPending}
                  >
                    {updateMemberMutation.isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
