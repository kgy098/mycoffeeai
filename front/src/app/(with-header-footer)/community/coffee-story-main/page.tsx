"use client";
import { useHeaderStore } from "@/stores/header-store";
import Link from "next/link";
import React, { useEffect } from "react";
import { useGet } from "@/hooks/useApi";

const CoffeStoryMain = () => {
  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: "커피스토리",
      showBackButton: false,
    });
  }, []);

  
  const { data: coffeeStories } = useGet<any[]>(
    ["coffee-stories"],
    "/api/coffee-stories"
  );
  return (
    <div className="bg-background">
      <div className="px-4 space-y-4">
        {(coffeeStories || []).map((story) => (
          <div
            key={story.id}
            className="bg-white rounded-lg p-3 border border-border-default"
          >
            {/* Review Image */}

            <div className="mb-3 rounded-lg overflow-hidden">
              <Link href={`/community/coffee-story-main/${story.id}`}>
                <img
                  src={story.thumbnail_url || "/images/ice-coffee.png"}
                  alt="Coffee review"
                  className="w-full h-90 max-h-[350px] object-cover rounded-lg"
                />
              </Link>
            </div>

            {/* Title*/}
            <Link
              href={`/community/coffee-story-main/${story.id}`}
              className="text-base font-bold inline-block leading-[20px] mb-1 cursor-pointer"
            >
              오늘의 커피 이야기: {story.title}
            </Link>
            {/* Date */}
            <p className="text-[12px] font-normal text-text-secondary mb-3">
              {story.created_at
                ? new Date(story.created_at).toLocaleDateString("ko-KR")
                : ""}
            </p>

            {/* Description */}
            <p className="text-xs leading-[20px]  line-clamp-2">
              {story.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoffeStoryMain;
