import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserCircle } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex items-center px-4 justify-between">
            <SidebarTrigger />
            <h1 className="flex items-center gap-3">
              <UserCircle />
              Admin
            </h1>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
