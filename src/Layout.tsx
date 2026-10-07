import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LogOut, UserCircle } from "lucide-react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";


export default function Layout() {
  const { user, loading, signOut } = useAuth();
  const { displayName } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-[100svh] w-full min-w-0">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b bg-card/80 px-3 backdrop-blur-sm sm:px-4">
            <SidebarTrigger className="h-10 w-10 shrink-0" />
            <div className="flex min-w-0 items-center gap-1 sm:gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <UserCircle className="h-5 w-5" />
                <span className="max-w-[130px] truncate text-sm sm:max-w-xs">{displayName || user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="h-10 shrink-0 gap-2 px-2 sm:px-3"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </header>
          <main className="min-w-0 flex-1 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
        
      </div>
    </SidebarProvider>
  );
}
