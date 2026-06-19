import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  User,
  FileText,
  Flag,
  Menu,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser, useClerk } from "@clerk/clerk-react";

const Navbar: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/reports", label: "Reports", icon: FileText },
    { path: "/campaigns", label: "Campaigns", icon: Flag },
  ];

  const isActive = (path: string) => location.pathname === path;

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => mobile && setIsOpen(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive(item.path)
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary text-foreground"
            } ${mobile ? "w-full" : ""}`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  // Get user's name
  const userName =
    user?.fullName ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "User";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dreamers
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavLinks />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>

            {user && (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Hi, {userName.split(" ")[0]}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  {user && (
                    <div className="pb-4 border-b">
                      <p className="font-semibold">{userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.emailAddresses?.[0]?.emailAddress || ""}
                      </p>
                    </div>
                  )}
                  <NavLinks mobile />
                  {user && (
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                      className="mt-4"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
