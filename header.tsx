import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {subtitle || currentDate}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -left-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" />
              <AvatarFallback>أم</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">أحمد محمد</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">مدير المجموعة</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
