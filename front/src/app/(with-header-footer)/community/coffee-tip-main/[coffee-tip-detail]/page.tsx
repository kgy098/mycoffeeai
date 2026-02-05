"use client";
import { useHeaderStore } from "@/stores/header-store";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useGet } from "@/hooks/useApi";

const CoffeeTipDetail = () => {
  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: "커피팁",
      showBackButton: true,
    });
  }, []);

  const params = useParams();
  const tipIdParam = Array.isArray(params["coffee-tip-detail"])
    ? params["coffee-tip-detail"][0]
    : params["coffee-tip-detail"];
  const tipId = Number(tipIdParam);

  const { data: tip } = useGet<any>(
    ["coffee-tip-detail", tipId],
    `/api/coffee-tips/${tipId}`,
    {},
    { enabled: Number.isFinite(tipId) }
  );

  return (
    <div className="bg-background">
      <div className="px-4 pt-4 pb-2">
        <div className="bg-white rounded-lg p-3 border border-border-default">
          <p className="text-base font-bold inline-block leading-[20px] mb-1">
            {tip?.title || "커피팁"}
          </p>
          <p className="text-[12px] font-normal text-text-secondary mb-3">
            {tip?.created_at
              ? new Date(tip.created_at).toLocaleDateString("ko-KR")
              : ""}
          </p>
          <div className="mb-3 rounded-lg overflow-hidden">
            <img
              src={tip?.thumbnail_url || "/images/ice-coffee.png"}
              alt="Coffee tip"
              className="w-full h-90 max-h-[350px] object-cover rounded-lg"
            />
          </div>
          <p className="text-xs leading-[20px]">{tip?.content || ""}</p>
        </div>
      </div>
    </div>
  );
};

export default CoffeeTipDetail;
