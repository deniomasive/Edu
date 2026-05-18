import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useListNotifications } from "@workspace/api-client-react";
import { Menu, X, ChevronDown, Bell, User, LogOut, Settings, LayoutDashboard, Shield } from "lucide-react";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/exames", label: "Exames" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/videos", label: "Vídeos" },
  { href: "/publicacoes", label: "Publicações" },
  { href: "/classificacao", label: "Classificação" },
  { href: "/faq", label: "FAQ" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: notifications } = useListNotifications({ query: { enabled: isAuthenticated } });
  const unreadCount = notifications?.filter(n => !n.lida).length ?? 0;

  const isActive = (href: string) => href === "/" ? location === "/" : location.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl tracking-tight hover:opacity-90 transition-opacity">
            Moz-Gondza
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-white/20 text-white"
                    : "hover:bg-white/10 text-white/85"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Area */}
          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {/* Dashboard */}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    Dashboard
                  </Button>
                </Link>
                {/* Notifications */}
                <Link href="/notificacoes">
                  <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-accent text-accent-foreground flex items-center justify-center">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 gap-1">
                      <User className="h-4 w-4" />
                      <span className="max-w-24 truncate">{user.nome.split(" ")[0]}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/perfil" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" /> Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/configuracoes" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" /> Configurações
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                            <Shield className="h-4 w-4" /> Painel Admin
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4" /> Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">Entrar</Button>
                </Link>
                <Link href="/registro">
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">Registar</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-primary">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href) ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10 space-y-1">
              {isAuthenticated && user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-white/10">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link href="/notificacoes" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-white/10">
                    <Bell className="h-4 w-4" /> Notificações {unreadCount > 0 && `(${unreadCount})`}
                  </Link>
                  <Link href="/perfil" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-white/10">
                    <User className="h-4 w-4" /> Perfil
                  </Link>
                  <Link href="/configuracoes" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-white/10">
                    <Settings className="h-4 w-4" /> Configurações
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-white/10">
                      <Shield className="h-4 w-4" /> Painel Admin
                    </Link>
                  )}
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm hover:bg-white/10 text-left text-red-300">
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm hover:bg-white/10">Entrar</Link>
                  <Link href="/registro" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm bg-accent hover:bg-accent/90 text-accent-foreground">Registar</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
