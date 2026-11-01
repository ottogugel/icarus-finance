import { useEffect, useState } from "react";
import { LayoutDashboard, Receipt, Tag, Target, Building2, Settings, CreditCard, Wallet, ChevronDown, ChevronUp, ArrowUpRight, X, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transações", url: "/transactions", icon: Receipt },
];
const walletItems = [
  { title: "Bancos", url: "/banks", icon: Building2 },
  { title: "Cartões", url: "/credit-cards", icon: CreditCard },
];
const otherItems = [
  { title: "Categorias", url: "/categories", icon: Tag },
  { title: "Metas", url: "/goals", icon: Target },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { displayName } = useProfile();
  const { user, signOut } = useAuth();
  const walletActive = walletItems.some((item) => currentPath.startsWith(item.url));
  const [walletOpen, setWalletOpen] = useState(true);
  useEffect(() => {
    if (walletActive) setWalletOpen(true);
  }, [walletActive, currentPath]);
  const renderItem = (item: (typeof mainItems)[number], nested = false) => (
    <SidebarMenuItem key={item.url}>
      <SidebarMenuButton
        asChild
        isActive={item.url === "/" ? currentPath === "/" : currentPath.startsWith(item.url)}
        className={cn("h-11 gap-3 rounded-lg px-3 transition-colors motion-reduce:transition-none", nested && "pl-9")}
      >
        <NavLink to={item.url} aria-label={item.title} end={item.url === "/"} onClick={() => isMobile && setOpenMobile(false)}>
          <item.icon strokeWidth={1.7} />
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="none" className="border-sidebar-border">
      <SidebarHeader className="h-24 justify-center border-b border-sidebar-border px-5">
        <div className="flex items-center gap-3">
          <NavLink to="/" aria-label="Icarus Finance — Dashboard" onClick={() => isMobile && setOpenMobile(false)} className="flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <ArrowUpRight className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <span className="text-xl font-bold leading-tight text-foreground">Icarus<span className="block text-xs font-medium text-sidebar-foreground">Finance</span></span>
          </NavLink>
          {isMobile && <Button variant="ghost" size="icon" aria-label="Fechar menu" className="ml-auto shrink-0 text-sidebar-foreground hover:bg-sidebar-accent" onClick={() => setOpenMobile(false)}><X className="h-4 w-4" /></Button>}
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0 py-4">
        <SidebarGroup className="px-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainItems.map((item) => renderItem(item))}
              <SidebarMenuItem>
                <SidebarMenuButton aria-expanded={walletOpen} aria-controls="wallet-navigation" onClick={() => setWalletOpen((open) => !open)} className="h-11 gap-3 rounded-lg px-3" isActive={walletActive && !walletOpen}>
                  <Wallet strokeWidth={1.7} /><span>Carteira</span>
                  <ChevronDown className={cn("ml-auto transition-transform motion-reduce:transition-none", walletOpen && "rotate-180")} />
                </SidebarMenuButton>
              </SidebarMenuItem>
              {walletOpen && <li id="wallet-navigation"><SidebarMenu className="gap-1.5">{walletItems.map((item) => renderItem(item, true))}</SidebarMenu></li>}
              {otherItems.map((item) => renderItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-3 py-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton aria-label="Menu da conta" className="h-12 w-full gap-3 rounded-lg px-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent font-semibold text-sidebar-accent-foreground">{displayName.trim().charAt(0).toUpperCase() || "U"}</span>
                  <span className="min-w-0 flex-1 truncate text-left font-medium text-foreground">{displayName || "Minha conta"}</span>
                  <ChevronUp className="h-4 w-4 shrink-0 text-sidebar-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                sideOffset={8}
                className="w-[calc(var(--sidebar-width)_-_1.5rem)] min-w-52"
              >
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onSelect={(event) => {
                    event.preventDefault();
                    signOut();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
