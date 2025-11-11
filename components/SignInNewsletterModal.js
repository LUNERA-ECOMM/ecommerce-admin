'use client';

import { useState, useEffect } from 'react';
import { signInWithGoogle, subscribeToAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const MODAL_SHOWN_KEY = 'signin_newsletter_modal_shown';

export default function SignInNewsletterModal() {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if modal was already shown this session
    const wasShown = sessionStorage.getItem(MODAL_SHOWN_KEY);
    
    // Subscribe to auth state
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      // If user signs in, close modal
      if (currentUser) {
        setShowModal(false);
      } else if (!wasShown) {
        // Only show if not signed in and hasn't been shown this session
        setShowModal(true);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
      // Modal will close automatically when user state updates
    } catch (error) {
      console.error('Sign in error:', error);
      setSigningIn(false);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    // Here you would typically send to your newsletter service
    // For now, just mark as subscribed
    setNewsletterSubscribed(true);
    
    // You could add a call to your backend/newsletter API here
    // await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
    
    setTimeout(() => {
      setNewsletterSubscribed(false);
      setEmail('');
    }, 2000);
  };

  const handleClose = () => {
    setShowModal(false);
    sessionStorage.setItem(MODAL_SHOWN_KEY, 'true');
  };

  // Don't show if user is signed in or modal was already shown
  if (!showModal || user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-600"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.312-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>

          <h2 className="mb-2 text-2xl font-light text-slate-800">Join us for exclusive offers</h2>
          <p className="mb-6 text-sm text-slate-600">
            Sign in to save your cart and get early access to new collections, special discounts, and style tips delivered to your inbox.
          </p>

          {/* Sign in button */}
          <button
            type="button"
            onClick={handleSignIn}
            disabled={signingIn}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-50"
          >
            {signingIn ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or</span>
            </div>
          </div>

          {/* Newsletter signup */}
          <form onSubmit={handleNewsletterSubmit} className="space-y-3">
            <label htmlFor="newsletter-email" className="block text-left text-sm font-medium text-slate-700">
              Subscribe to our newsletter
            </label>
            <div className="flex gap-2">
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 rounded-xl border border-primary/30 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button
                type="submit"
                disabled={newsletterSubscribed || !email}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
              >
                {newsletterSubscribed ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
            {newsletterSubscribed && (
              <p className="text-sm text-green-600">✓ Subscribed! Check your email.</p>
            )}
          </form>

          {/* Skip link */}
          <button
            type="button"
            onClick={handleClose}
            className="mt-4 text-sm text-slate-500 underline transition hover:text-slate-700"
          >
            Continue without signing in
          </button>
        </div>
      </div>
    </div>
  );
}


