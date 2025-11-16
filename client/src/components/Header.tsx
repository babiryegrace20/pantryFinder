import { Link } from "wouter";
import { Heart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  currentUser?: {
    name: string;
    role: "individual" | "pantry-admin" | "admin";
  } | null;
  onGetHelp?: () => void;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export function Header({ currentUser, onGetHelp, onSignIn, onSignOut }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-2 -ml-3">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Food Pantry Finder</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-user-menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href="/profile">
                    <DropdownMenuItem data-testid="menu-profile">
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  {currentUser.role === "pantry-admin" && (
                    <Link href="/pantry-dashboard">
                      <DropdownMenuItem data-testid="menu-dashboard">
                        My Dashboard
                      </DropdownMenuItem>
                    </Link>
                  )}
                  {currentUser.role === "admin" && (
                    <Link href="/admin-dashboard">
                      <DropdownMenuItem data-testid="menu-admin">
                        Admin Panel
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuItem onClick={onSignOut} data-testid="menu-signout">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden md:flex"
                onClick={onSignIn}
                data-testid="button-signin"
              >
                Sign In
              </Button>
              <Button onClick={onGetHelp} data-testid="button-get-help">
                Get Help
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
