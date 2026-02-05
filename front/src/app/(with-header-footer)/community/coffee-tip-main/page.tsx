"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useHeaderStore } from "@/stores/header-store";
import { useGet } from "@/hooks/useApi";

const CoffeeTipMain = () => {
  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: "커피팁",
      showBackButton: false,
    });
  }, []);

  const { data: tips } = useGet<any[]>(["coffee-tips"], "/api/coffee-tips");

  return (
    <div className="bg-background">
      <div className="px-4 space-y-4">
        {(tips || []).map((tip) => (
          <Link
            href={`/community/coffee-tip-main/${tip.id}`}
            key={tip.id}
            className="bg-white block rounded-lg p-3 border border-border-default"
          >
            <div className="mb-3 rounded-lg overflow-hidden">
              <img
                src={tip.thumbnail_url || "/images/ice-coffee.png"}
                alt="Coffee tip"
                className="w-full h-90 max-h-[180px] object-cover rounded-lg"
              />
            </div>
            <p className="text-base font-bold leading-[20px] mb-1 cursor-pointer">
              {tip.title}
            </p>
            <p className="text-[12px] font-normal text-text-secondary">
              {tip.created_at
                ? new Date(tip.created_at).toLocaleDateString("ko-KR")
                : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CoffeeTipMain;
