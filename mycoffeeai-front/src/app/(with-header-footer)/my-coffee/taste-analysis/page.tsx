"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import CoffeeBrewingAnimation from "./CoffeeBrewingAnimation";
import Link from "next/link";
import SpiderChart from "@/app/(content-only)/analysis/SpiderChart";
import { CoffeeData, CoffeePreferences } from "@/types/coffee";
import { usePost } from "@/hooks/useApi";
import { RecommendationRequest } from "@/app/(content-only)/analysis/types";
import { useRecommendationStore } from "@/stores/recommendation-store";
import { useUserStore } from "@/stores/user-store";
import { useTasteAnalysis } from "./TasteAnalysisContext";

const TasteAnalysisPage = () => {
  const [showBrewingAnimation, setShowBrewingAnimation] = useState(false);
  const router = useRouter();
  const { user } = useUserStore();
  const { setRecommendations } = useTasteAnalysis();
  const [ratings, setRatings] = useState<CoffeePreferences>({
    aroma: 1,
    sweetness: 1,
    body: 1,
    nutty: 1,
    acidity: 1,
  });
  const { setPreferences } = useRecommendationStore();


  const handleStartAnalysis = () => {
    handleSubmitAnalysis();
    setShowBrewingAnimation(true);
  };

  const handleAnimationComplete = () => {
    setShowBrewingAnimation(false);
    // Navigate to ready page using Next.js router
    router.push('/my-coffee/taste-analysis/ready');
  };


  const { mutate: getRecommendations, isPending: isGettingRecommendations } = usePost<CoffeeData, RecommendationRequest>(
    '/recommendation',
    {
      onSuccess: (data) => {
        if (data?.data?.preferences) {
          setPreferences(data?.data?.preferences);
        }
        // Save recommendations to context
        if (data?.data?.recommendations) {          
          setRecommendations(data.data.recommendations);
        }
      },
    }
  );

  // Handle form submission
  const handleSubmitAnalysis = useCallback(() => {
    getRecommendations({
      aroma: ratings.aroma,
      acidity: ratings.acidity,
      nutty: ratings.nutty,
      body: ratings.body,
      sweetness: ratings.sweetness,
      userId: user?.data?.user_id,
      saveAnalysis: 0,
    });
  }, [ratings]);


  if (showBrewingAnimation) {
    return <CoffeeBrewingAnimation onComplete={handleAnimationComplete} isGettingRecommendations={isGettingRecommendations} />;
  }

  return (
    <div className="px-4 pt-[36px] h-[calc(100dvh-206px)] flex flex-col">
      {/* Main Prompt */}
      <div className="text-center mb-8">
        <h1 className="text-[20px] font-bold text-gray-0 leading-[28px]">나만의 커피 취향을 찾아볼까요?</h1>
      </div>

      {/* Radar Chart */}
      <div className="flex justify-center mb-10">
        <SpiderChart ratings={ratings} setRatings={setRatings} />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mt-auto">
        <button
          onClick={handleStartAnalysis}
          className="block w-full btn-primary text-center"
        >
          취향 분석 시작
        </button>

        <Link href={'/my-coffee/taste-analysis/ready'} className="block w-full rounded-lg font-bold !py-2.5 border-1 border-[#4E2A18] text-[#4E2A18] text-center">
          지난 커피 분석 보기
        </Link>
      </div>
    </div>
  );
};

export default TasteAnalysisPage;
