"use client";

import React, { useState } from "react";
import Link from "next/link";
import ActionSheet from "@/components/ActionSheet";
import { CircleAlert, Trash, X } from "lucide-react";
import { useTasteAnalysis } from "../TasteAnalysisContext";

const ReadyPage = () => {

  const [showWarning, setShowWarning] = useState(true);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const { recommendations } = useTasteAnalysis();

  const handleDelete = () => {
    setDeleteModalIsOpen(false);
  };
  
  return (
    <div className="bg-background">
      {/* Warning Banner */}
      {showWarning && (
        <div className="bg-[#FFF3CD] mx-4 mt-4 rounded-lg px-4 py-3 flex items-center gap-2">
          <CircleAlert size={24} className="text-[#F59E0B]" />
          <p className="text-[#F59E0B] text-xs font-normal flex-1 leading-[150%]">
            지난 커피 분석은 24시간 후 사라집니다. 마음에 드는 커피는 내 컬렉션에 담아두세요.
          </p>
          <button
            onClick={() => setShowWarning(false)}
            className="flex-shrink-0 cursor-pointer"
          >
            <X size={24} className="text-gray-0" />
          </button>
        </div>
      )}

      {/* Coffee Analysis Cards */}
      <div className="px-4 mt-4 space-y-4">
        {recommendations.map((analysis, index) => (
          <div key={index} className="bg-white rounded-2xl px-4 py-3 border border-border-default">
            <h3 className="text-sm font-bold text-gray-0 mb-2">
              {analysis.coffee_name}
            </h3>

            <p className="text-xs text-text-secondary mb-4">
              {/* {analysis.date} {analysis.time} */}
              2025-08-24 오후 12:34
            </p>

            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/my-coffee/taste-analysis/ready/${analysis.coffee_blend_id}`}
                className="btn-action text-center"
              >
                취향 분석 시작
              </Link>

              <button onClick={() => setDeleteModalIsOpen(true)} className="size-8 border border-border-default rounded-sm flex items-center justify-center cursor-pointer " >
                <Trash size={20} className="text-action-primary" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Delete Confirmation ActionSheet */}
      <ActionSheet
        isOpen={deleteModalIsOpen}
        onClose={() => setDeleteModalIsOpen(false)}
      >
        <div className="text-center">
          <p className="text-base font-bold text-gray-0 mb-6 leading-[20px]">
            정말 삭제하시겠습니까?
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleDelete}
              className="w-full btn-primary"
            >
              예
            </button>
            <button
              onClick={() => setDeleteModalIsOpen(false)}
              className="w-full btn-primary-empty"
            >
              아니오
            </button>
          </div>
        </div>
      </ActionSheet>
    </div>
  );
};

export default ReadyPage;
