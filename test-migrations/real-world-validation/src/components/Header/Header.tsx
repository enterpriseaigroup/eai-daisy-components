/**
 * Header - Configurator V2 Component
 *
 * Component Header from Header.tsx
 *
 * @migrated from DAISY v1
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, User, LogOut, Settings, ArrowRightLeft, LogIn, MessageCircle, Plus, HelpCircle, X } from 'lucide-react';
import { useHeader } from './useHeader';
import { LoginLoader } from '../../loader/LoginLoader';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

  /**
   * BUSINESS LOGIC: Header
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements Header logic
   * 2. Calls helper functions: useHeader, useState, useCallback, setIsHelpOpen, useCallback, setIsProfileOpen, useCallback, setIsMobileMenuOpen, projects.map, projects.find, handleProjectSelection, handleProjectSelection, handleProjectSelection, toggleHelpMenu, toggleHelpMenu, toggleProfileMenu, handleLogin, toggleProfileMenu, toggleProfileMenu, toggleProfileMenu, handleLogout, projects.map, projects.find, handleProjectSelection, handleProjectSelection, setIsMobileMenuOpen, handleProjectSelection, setIsMobileMenuOpen, setIsMobileMenuOpen, setIsMobileMenuOpen, setIsMobileMenuOpen, handleLogin, setIsMobileMenuOpen, setIsMobileMenuOpen, setIsMobileMenuOpen, handleLogout
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useHeader() - Function call
   * - useState() - Function call
   * - useCallback() - Function call
   * - setIsHelpOpen() - Function call
   * - useCallback() - Function call
   * - setIsProfileOpen() - Function call
   * - useCallback() - Function call
   * - setIsMobileMenuOpen() - Function call
   * - projects.map() - Function call
   * - projects.find() - Function call
   * - handleProjectSelection() - Function call
   * - handleProjectSelection() - Function call
   * - handleProjectSelection() - Function call
   * - toggleHelpMenu() - Function call
   * - toggleHelpMenu() - Function call
   * - toggleProfileMenu() - Function call
   * - handleLogin() - Function call
   * - toggleProfileMenu() - Function call
   * - toggleProfileMenu() - Function call
   * - toggleProfileMenu() - Function call
   * - handleLogout() - Function call
   * - projects.map() - Function call
   * - projects.find() - Function call
   * - handleProjectSelection() - Function call
   * - handleProjectSelection() - Function call
   * - setIsMobileMenuOpen() - Function call
   * - handleProjectSelection() - Function call
   * - setIsMobileMenuOpen() - Function call
   * - setIsMobileMenuOpen() - Function call
   * - setIsMobileMenuOpen() - Function call
   * - setIsMobileMenuOpen() - Function call
   * - handleLogin() - Function call
   * - setIsMobileMenuOpen() - Function call
   * - setIsMobileMenuOpen() - Function call
   * - setIsMobileMenuOpen() - Function call
   * - handleLogout() - Function call
   *
   * WHY IT CALLS THEM:
   * - useHeader: Required functionality
   * - useState: Required functionality
   * - useCallback: Required functionality
   * - setIsHelpOpen: State update
   * - useCallback: Required functionality
   * - setIsProfileOpen: State update
   * - useCallback: Required functionality
   * - setIsMobileMenuOpen: State update
   * - projects.map: Required functionality
   * - projects.find: Required functionality
   * - handleProjectSelection: Required functionality
   * - handleProjectSelection: Required functionality
   * - handleProjectSelection: Required functionality
   * - toggleHelpMenu: Required functionality
   * - toggleHelpMenu: Required functionality
   * - toggleProfileMenu: Required functionality
   * - handleLogin: Required functionality
   * - toggleProfileMenu: Required functionality
   * - toggleProfileMenu: Required functionality
   * - toggleProfileMenu: Required functionality
   * - handleLogout: Required functionality
   * - projects.map: Required functionality
   * - projects.find: Required functionality
   * - handleProjectSelection: Required functionality
   * - handleProjectSelection: Required functionality
   * - setIsMobileMenuOpen: State update
   * - handleProjectSelection: Required functionality
   * - setIsMobileMenuOpen: State update
   * - setIsMobileMenuOpen: State update
   * - setIsMobileMenuOpen: State update
   * - setIsMobileMenuOpen: State update
   * - handleLogin: Required functionality
   * - setIsMobileMenuOpen: State update
   * - setIsMobileMenuOpen: State update
   * - setIsMobileMenuOpen: State update
   * - handleLogout: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useHeader, useState, useCallback to process data
   * Output: Computed value or side effect
   *
   */
export default function Header() {
  const {
    isAuthenticated,
    displayName,
    handleLogin,
    handleLogout,
    isHelpOpen,
    profileData,
    councilLogoSrc,
    loading,
    isError,
    error,
    projects,
    setIsHelpOpen,
    isProfileOpen,
    setIsProfileOpen,
    applicationName,
    handleProjectSelection,
  } = useHeader();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    /**
     * BUSINESS LOGIC: toggleHelpMenu
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls setIsHelpOpen functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - setIsHelpOpen() - Function call
     *
     * WHY IT CALLS THEM:
     * - setIsHelpOpen: State update
     *
     * DATA FLOW:
     * Input: setIsHelpOpen state/props
     * Processing: Calls setIsHelpOpen to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - setIsHelpOpen: Triggers when setIsHelpOpen changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const toggleHelpMenu = useCallback((shouldSet: boolean) => setIsHelpOpen(shouldSet), [setIsHelpOpen]);
    /**
     * BUSINESS LOGIC: toggleProfileMenu
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls setIsProfileOpen functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - setIsProfileOpen() - Function call
     *
     * WHY IT CALLS THEM:
     * - setIsProfileOpen: State update
     *
     * DATA FLOW:
     * Input: setIsProfileOpen state/props
     * Processing: Calls setIsProfileOpen to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - setIsProfileOpen: Triggers when setIsProfileOpen changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const toggleProfileMenu = useCallback((shouldSet: boolean) => setIsProfileOpen(shouldSet), [setIsProfileOpen]);
    /**
     * BUSINESS LOGIC: toggleMobileMenu
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls setIsMobileMenuOpen functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - setIsMobileMenuOpen() - Function call
     *
     * WHY IT CALLS THEM:
     * - setIsMobileMenuOpen: State update
     *
     * DATA FLOW:
     * Input: isMobileMenuOpen state/props
     * Processing: Calls setIsMobileMenuOpen to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - isMobileMenuOpen: Triggers when isMobileMenuOpen changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(!isMobileMenuOpen), [isMobileMenuOpen]);

  // #1061 - removed !profileData.current_org_id as we have a scenario of it being null
  if (isAuthenticated && (!profileData)) {
    return <LoginLoader />;
  }

  return (
    <header className="relative z-50 w-full border-b bg-background">
      {/* Header container - full width on all screen sizes */}
      <div className="w-full mx-auto xl:max-w-[1280px] 2xl:max-w-[1536px]">
        {/* Desktop Header */}
        <div className="items-center justify-between hidden px-4 py-3 lg:flex sm:px-6 lg:px-8">
          {/* Left: Logo + Welcome */}
          <div className="flex items-center gap-4 sm:gap-10">
            <button
              onClick={() => {
                window.location.href = '/dashboard'; // Hard reload always
              }}
              className="flex items-center"
            >
              <Image
                src={councilLogoSrc}
                alt="Council Logo"
                width={120}
                height={32}
                className="w-auto h-12"
                priority
              />
            </button>
          </div>

          {/* Right: Navigation */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {/* Project Selection - Fixed width of 300px with overflow fixes */}
            {isAuthenticated && (
              <Select
                onValueChange={(value) => {
                  const project = projects.find(p => p.id === value);
                  if (project) {
                    handleProjectSelection(project);
                  } else if (value === "new-project") {
                    handleProjectSelection({
                      id: "new-project",
                      title: "New Project",
                      description: profileData?.current_org_id || ""
                    }, true);
                  }
                }}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder={applicationName || "Select project"} />
                </SelectTrigger>
                {/* Solution 1: Use align="end" and set max width with scrolling */}
                <SelectContent 
                  align="end" 
                  className="w-[300px] max-h-[300px] overflow-y-auto"
                  side="bottom"
                  sideOffset={4}
                >
                  {!applicationName && loading && (
                    <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                  )}
                  {!applicationName && isError && (
                    <SelectItem value="error" disabled>Error: {error?.message}</SelectItem>
                  )}
                  {!loading && !isError && projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="truncate" title={project.title}>
                        {project.title}
                      </div>
                    </SelectItem>
                  ))}
                  {/* Divider */}
                  <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                  {/* New Project item with circled icon */}
                  <SelectItem value="new-project">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center flex-shrink-0 w-4 h-4 border border-gray-400 rounded-full">
                        <Plus className="w-3 h-3" />
                      </div>
                      <span>New project</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* New Project Button for unauthenticated users */}
            {!isAuthenticated && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => {
                  handleProjectSelection({
                    id: "new-project",
                    title: "New Project",
                    description: profileData?.current_org_id || ""
                  }, true, true);
                }}
              >
                <div className="flex items-center justify-center flex-shrink-0 w-4 h-4 border border-gray-400 rounded-full">
                  <Plus className="w-3 h-3" />
                </div>
                <span className="hidden text-sm font-medium leading-tight sm:inline text-Foreground">New Project</span>
              </Button>
            )}

            {/* Help Button */}
            <DropdownMenu open={isHelpOpen} onOpenChange={toggleHelpMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden text-sm font-medium leading-tight sm:inline text-Foreground">Help</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/faq" onClick={() => toggleHelpMenu(false)} className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" /> FAQ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact-us" onClick={() => toggleHelpMenu(false)} className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Contact Us
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Button */}
            <DropdownMenu open={isProfileOpen} onOpenChange={toggleProfileMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden text-sm font-medium leading-tight sm:inline text-Foreground">Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 font-medium text-foreground">{displayName}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/switch-council" onClick={() => toggleProfileMenu(false)} className="flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4" /> Switch Council
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/edit-profile" onClick={() => toggleProfileMenu(false)} className="flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Edit Personal Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        toggleProfileMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem 
                    onClick={() => {
                      toggleProfileMenu(false);
                      handleLogin();
                    }}
                    className="flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> Log in
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden">
          {/* Mobile Header Bar */}
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <button
              onClick={() => {
                window.location.href = '/dashboard';
              }}
              className="flex items-center"
            >
              <Image
                src={councilLogoSrc}
                alt="Council Logo"
                width={100}
                height={26}
                className="w-auto h-8 sm:h-10"
                priority
              />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <div className="flex flex-col items-center justify-center w-5 h-5 gap-0.5">
                  <div className="w-4 h-0.5 bg-foreground"></div>
                  <div className="w-4 h-0.5 bg-foreground"></div>
                  <div className="w-4 h-0.5 bg-foreground"></div>
                </div>
              )}
            </button>
          </div>

          {/* Mobile Menu Panel - Now overlays instead of pushing content */}
          {isMobileMenuOpen && (
            <div className="absolute left-0 right-0 z-50 border-t shadow-lg top-full bg-background">
              <div className="px-4 py-3 space-y-3">
                {/* Project Selection - Full width on mobile with overflow handling */}
                {isAuthenticated && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-muted-foreground">
                      Current Project
                    </label>
                    <Select
                      onValueChange={(value) => {
                        const project = projects.find(p => p.id === value);
                        if (project) {
                          handleProjectSelection(project);
                        } else if (value === "new-project") {
                          handleProjectSelection({
                            id: "new-project",
                            title: "New Project",
                            description: profileData?.current_org_id || ""
                          }, true);
                        }
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={applicationName || "Select project"} />
                      </SelectTrigger>
                      <SelectContent 
                        className="max-w-[calc(100vw-2rem)] max-h-[200px] overflow-y-auto"
                        side="bottom"
                        align="start"
                      >
                        {!applicationName && loading && (
                          <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                        )}
                        {!applicationName && isError && (
                          <SelectItem value="error" disabled>Error: {error?.message}</SelectItem>
                        )}
                        {!loading && !isError && projects.map((project) => (
                          <SelectItem key={project.id} value={project.id} className="max-w-full">
                            <div className="max-w-full pr-2 truncate" title={project.title}>
                              {project.title}
                            </div>
                          </SelectItem>
                        ))}
                        <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                        <SelectItem value="new-project">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center flex-shrink-0 w-4 h-4 border border-gray-400 rounded-full">
                              <Plus className="w-3 h-3" />
                            </div>
                            <span>New project</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* New Project Button for unauthenticated users on mobile */}
                {!isAuthenticated && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-muted-foreground">
                      Project
                    </label>
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => {
                        handleProjectSelection({
                          id: "new-project",
                          title: "New Project",
                          description: profileData?.current_org_id || ""
                        }, true, true);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-center flex-shrink-0 w-4 h-4 border border-gray-400 rounded-full">
                        <Plus className="w-3 h-3" />
                      </div>
                        <span>New Project</span>
                    </Button>
                  </div>
                )}

                {/* Mobile Menu Items */}
                <div className="pt-2 space-y-2 border-t">
                  {/* Help Section */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">Help & Support</p>
                    <div className="space-y-1">
                      <Link
                        href="/faq"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md hover:bg-muted"
                      >
                        <HelpCircle className="w-4 h-4" />
                        FAQ
                      </Link>
                      <Link
                        href="/contact-us"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md hover:bg-muted"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact Us
                      </Link>
                    </div>
                  </div>

                  {/* Profile Section */}
                  <div className="pt-2 border-t">
                    {isAuthenticated ? (
                      <>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                          Profile
                        </p>
                        <div className="space-y-1">
                          <Link
                            href="/switch-council"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md hover:bg-muted"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                            Switch Council
                          </Link>
                          <Link
                            href="/edit-profile"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md hover:bg-muted"
                          >
                            <Settings className="w-4 h-4" />
                            Edit Personal Details
                          </Link>
                          <button
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left transition-colors rounded-md hover:bg-muted"
                          >
                            <LogOut className="w-4 h-4" />
                            Log out
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogin();
                        }}
                        className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left transition-colors rounded-md hover:bg-muted"
                      >
                        <LogIn className="w-4 h-4" />
                        Log in
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}