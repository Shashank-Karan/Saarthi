import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, Users, FileText, Heart, Sparkles, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navigation() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="glassmorphism sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-all duration-300">
            <div className="text-lg sm:text-xl md:text-2xl">🕉️</div>
            <h1 className="text-lg sm:text-xl font-serif font-bold text-foreground" style={{ fontFamily: 'Playfair Display, serif' }}>
              Saarthi
            </h1>
          </Link>
          
          <div className="hidden md:flex items-center">
            <div className="glass-card px-4 lg:px-6 py-2 flex items-center space-x-4 lg:space-x-6 floating-action">
              <Link 
                href="/chat"
                className={`text-muted-foreground hover:text-primary transition-all duration-300 font-medium  ${
                  location === '/chat' ? 'text-primary font-semibold' : ''
                }`}
                data-testid="nav-chat"
              >
                Chat
              </Link>
              <Link 
                href="/community"
                className={`text-muted-foreground hover:text-primary transition-all duration-300 font-medium  ${
                  location === '/community' ? 'text-primary font-semibold' : ''
                }`}
                data-testid="nav-community"
              >
                Community
              </Link>
              <Link 
                href="/journal"
                className={`text-muted-foreground hover:text-primary transition-all duration-300 font-medium  ${
                  location === '/journal' ? 'text-primary font-semibold' : ''
                }`}
                data-testid="nav-journal"
              >
                Journal
              </Link>
              <Link 
                href="/krishna-path"
                className={`text-muted-foreground hover:text-primary transition-all duration-300 font-medium  ${
                  location === '/krishna-path' ? 'text-primary font-semibold' : ''
                }`}
                data-testid="nav-krishna-path"
              >
                Krishna Path
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full" data-testid="user-menu">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </DropdownMenuItem>
                  {user.is_admin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users" className="w-full">
                          <Users className="mr-2 h-4 w-4" />
                          Manage Users
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/content" className="w-full">
                          <FileText className="mr-2 h-4 w-4" />
                          Content Moderation
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/emotions-verses" className="w-full">
                          <Heart className="mr-2 h-4 w-4" />
                          Emotions & Verses
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/thoughts" className="w-full">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Manage Thoughts
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => logoutMutation.mutate()}
                    data-testid="logout-button"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-card border-t border-border">
            <div className="px-3 sm:px-4 py-3 space-y-3">
              <Link 
                href="/chat"
                className={`block text-muted-foreground hover:text-primary transition-colors font-medium py-2 ${
                  location === '/chat' ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-chat"
              >
                Chat
              </Link>
              <Link 
                href="/community"
                className={`block text-muted-foreground hover:text-primary transition-colors font-medium py-2 ${
                  location === '/community' ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-community"
              >
                Community
              </Link>
              <Link 
                href="/journal"
                className={`block text-muted-foreground hover:text-primary transition-colors font-medium py-2 ${
                  location === '/journal' ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-journal"
              >
                Journal
              </Link>
              <Link 
                href="/krishna-path"
                className={`block text-muted-foreground hover:text-primary transition-colors font-medium py-2 ${
                  location === '/krishna-path' ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-krishna-path"
              >
                Krishna Path
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
