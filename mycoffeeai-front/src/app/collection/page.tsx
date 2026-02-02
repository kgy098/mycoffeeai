'use client';

import Header from '@/components/Header';
import { useHeaderStore } from '@/stores/header-store';
import { useEffect } from 'react';

export default function CollectionPage() {
  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: "내 커피",
      showBackButton: true,
    });
  }, [setHeader]);

  return (
    <>
      <Header />
      <div className="bg-[#F9FAFB] min-h-screen">
        {/* Page content goes here */}
        <div className="p-4">
          <p>Collection page content</p>
        </div>
      </div>
    </>
  );
}
