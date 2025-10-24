'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useIsAuthenticated } from '@azure/msal-react';
import { useEffect, useState } from 'react';
import { useProfileStore } from '@presentation/store/useProfileStore';
import { LoginLoader } from './(presentation)/components/loader/LoginLoader';
import { useMsal } from "@azure/msal-react";
import { useTokenAndProfile } from "./(presentation)/hooks/useTokenAndProfile";
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { profileData } = useProfileStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRedirectFromCouncilPortal, setIsRedirectFromCouncilPortal] = useState(false);
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const { instance } = useMsal();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      const isFromCouncil = searchParams.get('councilPortal') === 'true';
      setIsRedirectFromCouncilPortal(isFromCouncil);

      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      setQueryParams(params);
      setIsLoading(false);
    }
  }, [searchParams]);

  const {
    refetch: fetchTokenAndProfileData,
    isLoading: isAuthLoading,
    error,
  } = useTokenAndProfile({
    onTokenAcquired: (token) => {
      console.log("Token acquired successfully", token);
    },
    onProfileFetched: (profile) => {
      console.log("Profile fetched successfully", profile);
      setIsLoggingIn(false);
    },
    onError: (error) => {
      console.error("Error during authentication:", error);
      setIsLoggingIn(false);
    },
    autoFetch: false,
    queryParams
  });

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await instance.loginRedirect({
        scopes: ['openid', 'profile', 'email'],
        prompt: 'create',
        redirectUri: window.location.origin,
      });
      await fetchTokenAndProfileData(); // won't run immediately after redirect, but safe to keep
    } catch (e) {
      console.error("loginRedirect error:", e);
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const role = profileData?.role || 'applicant';
      if (isRedirectFromCouncilPortal) {
        // Force applicant route regardless of role
        router.push('/dashboard');
      } else {
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else if (role === 'staff') {
          router.push('/staff/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, profileData, isRedirectFromCouncilPortal, router]);

  if (isLoading || isLoggingIn || isAuthLoading) {
    return <LoginLoader />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 overflow-y-auto bg-white">
        <div className="w-full max-w-md p-6 my-auto bg-white shadow-md sm:p-10 rounded-xl">
          <div className="mb-4 text-lg font-semibold text-red-600">
            Authentication Error
          </div>
          <p className="mb-4 text-sm text-gray-700 sm:text-base">
            There was an error during authentication. Please try again or contact support.
          </p>
          <button 
            onClick={handleLogin} 
            className="w-full py-3 text-sm text-black bg-white border border-black rounded-lg cursor-pointer sm:text-base hover:bg-gray-100"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isRedirectFromCouncilPortal) {
    return (
      <div
        className="min-h-screen overflow-y-auto"
        style={{
          backgroundImage: "url('/images/signinbg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Scrollable wrapper with proper padding */}
        <div className="flex flex-col items-center justify-start min-h-screen p-4 py-8 sm:py-12 sm:justify-center">
          <div className="w-full max-w-md p-6 sm:p-10 text-justify bg-white shadow-md rounded-xl font-geist text-[14px] my-auto">
            <Image
              src="/images/eai.png"
              alt="Enterprise AI"
              width={96}
              height={96}
              className="w-auto h-16 mx-auto mb-4 sm:h-24 sm:mb-6"
              unoptimized
            />
            <p className="mb-3 sm:mb-4 font-semibold text-center text-black text-[15px] sm:text-[16px]">
              Welcome to Enterprise AI
            </p>
            <p className="mb-3 sm:mb-4 text-gray-800 text-[13px] sm:text-[14px] leading-relaxed">
              You&apos;ve been invited to explore our Development Application Information System (DAISY)—most likely by someone sharing a feature or inviting collaboration.
            </p>
            <p className="mb-3 sm:mb-4 text-gray-800 text-[13px] sm:text-[14px] leading-relaxed">
              To proceed, please log in below.
            </p>
            <p className="mb-3 sm:mb-4 text-gray-800 text-[13px] sm:text-[14px] leading-relaxed">
              If your council isn&apos;t currently partnered with us, you can still explore the platform, but region-specific advice and some services may be restricted.
            </p>
            <p className="mb-4 sm:mb-6 text-gray-800 text-[13px] sm:text-[14px] leading-relaxed">
              <strong>Can&apos;t find your council?</strong> Contact them to encourage DAISY adoption, or get in touch with our{" "}
              <a
                href="https://www.enterpriseaigroup.com/get-started"
                className="text-blue-600 underline cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sales
              </a>{" "}
              or{" "}
              <a
                href="https://www.enterpriseaigroup.com/support"
                className="text-blue-600 underline cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Support
              </a>{" "}
              teams.
            </p>
            {/* Login button with better mobile spacing */}
            <div className="mt-6">
              <button
                onClick={handleLogin}
                className="w-full py-3 text-sm text-black transition-colors duration-200 bg-white border border-black rounded-lg cursor-pointer sm:py-4 sm:text-base hover:bg-gray-100"
              >
                <span className="text-[15px] sm:text-[16px] font-semibold">Login to Enterprise AI</span>
              </button>
            </div>
          </div>
          {/* Bottom spacing to ensure button is always accessible */}
          <div className="flex-shrink-0 h-8 sm:h-4"></div>
        </div>
      </div>
    );
  }

  return null;
}