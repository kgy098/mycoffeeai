"use client";
import React, { useEffect, useMemo, useState } from "react";
import Tabs from "@/components/Tabs";
import { usePathname, useRouter } from "next/navigation";
import { useHeaderStore } from "@/stores/header-store";
import dynamic from "next/dynamic";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { useGet } from "@/hooks/useApi";
import { useUserStore } from "@/stores/user-store";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';

// Dynamically import the tab components to avoid SSR issues
const WriteReview = dynamic(() => import("./write-review/page"), { ssr: false });
const History = dynamic(() => import("./history/page"), { ssr: false });

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('write-review');
  const [swiper, setSwiper] = useState<any>(null);
  const { data: user } = useUserStore((state) => state.user);

  const { data: reviewableItems } = useGet<any[]>(
    ["reviewable-orders", user?.user_id],
    "/api/reviews/reviewable",
    { params: { user_id: user?.user_id } },
    { enabled: !!user?.user_id }
  );

  const { data: myReviews } = useGet<any[]>(
    ["my-reviews", user?.user_id],
    `/api/reviews/user/${user?.user_id}`,
    {},
    { enabled: !!user?.user_id }
  );

  const reviewableCount = reviewableItems?.length ?? 0;
  const reviewHistoryCount = myReviews?.length ?? 0;

  const tabs = useMemo(() => [
    { id: 1, label: `리뷰작성 (${reviewableCount})`, value: "write-review" },
    { id: 2, label: `리뷰내역 (${reviewHistoryCount})`, value: "history" },
  ], [reviewableCount, reviewHistoryCount]);

  const isMainTabRoute = () => {
    const mainRoutes = ['/profile/reviews/write-review', '/profile/reviews/history'];
    return mainRoutes.some(route => pathname === route) || pathname.startsWith('/profile/reviews/history/');
  };

  const getCurrentTab = () => {
    if (pathname.includes('write-review')) return 'write-review';
    if (pathname.includes('history')) return 'history';
    return 'write-review';
  };

  const getTabIndex = (tab: string) => {
    return tabs.findIndex(t => t.value === tab);
  };

  useEffect(() => {
    const tabFromPath = getCurrentTab();
    if (tabFromPath !== currentTab) {
      setCurrentTab(tabFromPath);
      if (swiper && isMainTabRoute()) {
        const index = getTabIndex(tabFromPath);
        swiper.slideTo(index);
        setTimeout(() => {
          if (swiper && swiper.updateAutoHeight) {
            swiper.updateAutoHeight();
          }
        }, 50);
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (swiper) {
      const tabFromPath = getCurrentTab();
      const index = getTabIndex(tabFromPath);
      swiper.slideTo(index);
    }
  }, [swiper]);

  const handleTabChange = (tab: string) => {
    if (tab === currentTab) return;

    setCurrentTab(tab);
    router.push(`/profile/reviews/${tab}`, { scroll: false });

    if (swiper) {
      const index = getTabIndex(tab);
      swiper.slideTo(index);
      setTimeout(() => {
        if (swiper && swiper.updateAutoHeight) {
          swiper.updateAutoHeight();
        }
      }, 100);
    }
  };

  const handleSwiperSlideChange = (swiper: any) => {
    const activeIndex = swiper.activeIndex;
    const newTab = tabs[activeIndex];

    if (newTab && newTab.value !== currentTab) {
      setCurrentTab(newTab.value);
      router.push(`/profile/reviews/${newTab.value}`, { scroll: false });
    }

    setTimeout(() => {
      if (swiper && swiper.updateAutoHeight) {
        swiper.updateAutoHeight();
      }
    }, 100);
  };

  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: "내 리뷰",
    });
  }, []);

  if (!isMainTabRoute()) {
    return <div className="flex-1 overflow-y-auto">{children}</div>;
  }

  const isHistoryDetail = pathname.startsWith('/profile/reviews/history/');

  return (
    <div>
      <div className="bg-background mt-4 mb-4 px-4">
        <Tabs
          tabs={tabs}
          activeTab={currentTab}
          onTabChange={handleTabChange}
        />
      </div>

      <div className="flex-1 px-4 overflow-y-auto h-[calc(100vh-226px)]">
        {isHistoryDetail ? (
          <div>{children}</div>
        ) : (
          <Swiper
            onSwiper={setSwiper}
            onSlideChange={handleSwiperSlideChange}
            initialSlide={getTabIndex(currentTab)}
            modules={[FreeMode]}
            spaceBetween={0}
            slidesPerView={1}
            allowTouchMove={true}
            resistance={true}
            resistanceRatio={0.85}
            speed={300}
            autoHeight={true}
            updateOnWindowResize={true}
            observer={true}
            observeParents={true}
          >
            <SwiperSlide>
              <div>
                <WriteReview />
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div>
                <History />
              </div>
            </SwiperSlide>
          </Swiper>
        )}
      </div>
    </div>
  );
}
