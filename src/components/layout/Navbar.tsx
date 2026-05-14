import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, LogOut, Menu, X, Rocket, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/store";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useState } from "react";

export default function Navbar() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <Rocket className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-black tracking-tight hidden sm:block">
            SKILL<span className="text-primary italic">FORGE</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <Link to="/courses" className="hover:text-primary transition-colors">Courses</Link>
          <Link to="/ai-lab" className="hover:text-primary transition-colors">AI Lab</Link>
          <Link to="#" className="hover:text-primary transition-colors">Enterprise</Link>
          <Link to="#" className="hover:text-primary transition-colors">Resources</Link>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex relative items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search AI skills..." 
              className="pl-10 w-64 bg-muted/30 border-none h-10 focus-visible:ring-1 focus-visible:ring-primary/20"
            />
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchVisible(!isSearchVisible)}>
            <Search className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" className="relative group">
            <ShoppingCart className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-primary-foreground flex items-center justify-center rounded-full font-bold">0</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-border/50">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.photoURL || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user.displayName?.[0] || user.email?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
              <DropdownMenuContent className="w-56" align="end">
                <div className="px-2 py-1.5 bg-muted/20">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || "Learner"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link to="/dashboard" />}>
                  <LayoutDashboard className="w-4 h-4" />
                  Student Dashboard
                </DropdownMenuItem>
                {profile?.role === 'instructor' && (
                  <DropdownMenuItem render={<Link to="/instructor" />}>
                    <LayoutDashboard className="w-4 h-4" />
                    Instructor Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem render={<Link to="/settings" />}>
                  <User className="w-4 h-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer gap-2">
                  <LogOut className="w-4 h-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" render={<Link to="/login" />} className="hidden sm:inline-flex">
                Login
              </Button>
              <Button render={<Link to="/register" />}>
                Join Free
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              }
            />
            <SheetContent side="right">
              <div className="flex flex-col gap-6 mt-12">
                <Link to="/courses" className="text-lg font-bold">Courses</Link>
                <Link to="/ai-lab" className="text-lg font-bold">AI Lab</Link>
                <Link to="#" className="text-lg font-bold">Enterprise</Link>
                <Link to="#" className="text-lg font-bold">Resources</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
