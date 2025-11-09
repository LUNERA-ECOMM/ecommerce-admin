'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, auth, isAdmin } from '@/lib/auth';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && isAdmin(user.email)) {
        router.push('/admin/overview');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return null;
}

