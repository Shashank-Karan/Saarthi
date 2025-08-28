import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
    <nav className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="text-2xl">🕉️</div>
            <h1 className="text-xl font-serif font-bold text-foreground">Saarthi</h1>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/chat"
              className={`text-muted-foreground hover:text-primary transition-colors font-medium ${
                location === '/chat' ? 'text-primary' : ''
              }`}
              data-testid="nav-chat"
            >
              Chat
            </Link>
            <Link 
              href="/community"
              className={`text-muted-foreground hover:text-primary transition-colors font-medium ${
                location === '/community' ? 'text-primary' : ''
              }`}
              data-testid="nav-community"
            >
              Community
            </Link>
            <Link 
              href="/scripture"
              className={`text-muted-foreground hover:text-primary transition-colors font-medium ${
                location === '/scripture' ? 'text-primary' : ''
              }`}
              data-testid="nav-scriptures"
            >
              Scriptures
            </Link>
            <Link 
              href="/journal"
              className={`text-muted-foreground hover:text-primary transition-colors font-medium ${
                location === '/journal' ? 'text-primary' : ''
              }`}
              data-testid="nav-journal"
            >
              Journal
            </Link>
            <Link 
              href="/game"
              className={`text-muted-foreground hover:text-primary transition-colors font-medium ${
                location === '/game' ? 'text-primary' : ''
              }`}
              data-testid="nav-game"
            >
              Wisdom Cards
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
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
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-sm">
            <div className="px-4 py-3 space-y-3">
              <Link 
                href="/chat"
                className={`block text-muted-foreground hover:text-primary transition-colors font-medium ${
                  location === '/chat' ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-chat"
              >
                Chat
              </Link>
              <Link 
                href="/community"
                className={`block text-muted-foreground hover:text-primary transition-colors font-medium ${
                  location === '/community' ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-community"
              >
                Community
              </Link>
              <Link 
                href="/scripture"
                className={`block text-muted-foreground hover:text-primary transition-colors font-medium ${
                  location === '/scripture' ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-scriptures"
              >
                Scriptures
              </Link>
              <Link 
                href="/journal"
                className={`block text-muted-foreground hover:text-primary transition-colors font-medium ${
                  location === '/journal' ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-journal"
              >
                Journal
              </Link>
              <Link 
                href="/game"
                className={`block text-muted-foreground hover:text-primary transition-colors font-medium ${
                  location === '/game' ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-game"
              >
                Wisdom Cards
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
