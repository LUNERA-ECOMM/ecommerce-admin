'use client';

import { useCart } from '@/lib/cart';
import Link from 'next/link';
import { useMemo } from 'react';
import SignInNewsletterModal from '@/components/SignInNewsletterModal';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const formatPrice = (value) => currencyFormatter.format(value ?? 0);

export default function CartPage() {
  const { cart, loading, removeFromCart, updateQuantity, getCartTotal, getCartItemCount } = useCart();

  const subtotal = getCartTotal();
  const shipping = subtotal >= 150 ? 0 : 15; // Free shipping over $150
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-pink-50/40 to-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-32">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
            <p className="text-slate-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-pink-50/40 to-white">
        <header className="sticky top-0 z-40 border-b border-pink-100/70 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-sm font-medium text-pink-500 transition hover:text-pink-600">
              ← Back to shop
            </Link>
            <h1 className="text-xl font-light text-slate-800">Shopping Cart</h1>
            <div className="w-20" /> {/* Spacer */}
          </div>
        </header>

        <main className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-32">
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-pink-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <h2 className="mt-4 text-2xl font-light text-slate-800">Your cart is empty</h2>
            <p className="mt-2 text-slate-600">Start shopping to add items to your cart.</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-pink-500 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-pink-400"
            >
              Continue shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-pink-50/40 to-white">
      <SignInNewsletterModal />
      <header className="sticky top-0 z-40 border-b border-pink-100/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-pink-500 transition hover:text-pink-600">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span>Continue shopping</span>
          </Link>
          <h1 className="text-xl font-light text-slate-800">Shopping Cart ({getCartItemCount()} items)</h1>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || 'default'}`}
                  className="flex gap-6 rounded-2xl border border-pink-100/70 bg-white/90 p-6 shadow-sm"
                >
                  {item.image && (
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-pink-50/70">
                      <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-slate-800">{item.productName}</h3>
                        {item.variantName && (
                          <p className="text-sm text-slate-500">{item.variantName}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId, item.variantId)}
                        className="text-slate-400 transition hover:text-red-500"
                        aria-label="Remove item"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-pink-200 text-pink-600 transition hover:bg-pink-50"
                          aria-label="Decrease quantity"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                          </svg>
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-slate-800">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-pink-200 text-pink-600 transition hover:bg-pink-50"
                          aria-label="Increase quantity"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-lg font-semibold text-pink-500">{formatPrice(item.priceAtAdd * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-pink-100/70 bg-white/90 p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-slate-800">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}</span>
                </div>
                {subtotal < 150 && (
                  <p className="text-xs text-slate-500">
                    Add {formatPrice(150 - subtotal)} more for free shipping
                  </p>
                )}
                <div className="border-t border-pink-100 pt-4">
                  <div className="flex justify-between text-lg font-semibold text-slate-800">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-8 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-400">Payment Methods</h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Credit/Debit Card */}
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-pink-100/70 bg-white p-4 transition hover:border-pink-300 hover:bg-pink-50/50"
                  >
                    <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 21.75z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-700">Card</span>
                  </button>

                  {/* PayPal */}
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-pink-100/70 bg-white p-4 transition hover:border-pink-300 hover:bg-pink-50/50"
                  >
                    <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.203zm14.146-14.42a-.07.07 0 0 1 .032.064c.016.036.025.07.032.102.004.016.006.03.006.044v.002c-.206 1.783-1.168 3.322-2.73 4.344-1.56 1.01-3.388 1.304-5.37.833a.08.08 0 0 1-.06-.05l-1.11-7.15a.08.08 0 0 1 .05-.095c.016-.005.033-.008.05-.008h5.46c.92 0 1.752.24 2.45.71.696.47 1.24 1.12 1.56 1.9a.07.07 0 0 1 .01.03z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-700">PayPal</span>
                  </button>

                  {/* SEPA */}
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-pink-100/70 bg-white p-4 transition hover:border-pink-300 hover:bg-pink-50/50"
                  >
                    <svg className="h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-700">SEPA</span>
                  </button>

                  {/* Klarna */}
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-pink-100/70 bg-white p-4 transition hover:border-pink-300 hover:bg-pink-50/50"
                  >
                    <svg className="h-8 w-8 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 0-.315.06-.441.18-.126.12-.189.27-.189.45v6.42c0 .18.063.33.189.45.126.12.272.18.441.18.169 0 .315-.06.441-.18.126-.12.189-.27.189-.45V8.79c0-.18-.063-.33-.189-.45-.126-.12-.272-.18-.441-.18zm-4.182 0c-.169 0-.315.06-.441.18-.126.12-.189.27-.189.45v6.42c0 .18.063.33.189.45.126.12.272.18.441.18.169 0 .315-.06.441-.18.126-.12.189-.27.189-.45V8.79c0-.18-.063-.33-.189-.45-.126-.12-.272-.18-.441-.18zm-4.182 0c-.169 0-.315.06-.441.18-.126.12-.189.27-.189.45v6.42c0 .18.063.33.189.45.126.12.272.18.441.18.169 0 .315-.06.441-.18.126-.12.189-.27.189-.45V8.79c0-.18-.063-.33-.189-.45-.126-.12-.272-.18-.441-.18z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-700">Klarna</span>
                  </button>

                  {/* Apple Pay */}
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-pink-100/70 bg-white p-4 transition hover:border-pink-300 hover:bg-pink-50/50"
                  >
                    <svg className="h-8 w-8 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C1.79 15.25 2.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-700">Apple Pay</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Payment processing will be implemented soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

