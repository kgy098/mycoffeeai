"use client";
import { useHeaderStore } from "@/stores/header-store";
import React, { useEffect, useMemo, useState } from "react";
import { formatAmount } from "@/utils/helpers";
import { useGet } from "@/hooks/useApi";
import { useUserStore } from "@/stores/user-store";

interface PointTransaction {
  id: number;
  description: string;
  note: string | null;
  type: "earned" | "used" | "canceled";
  amount: number;
  date: string;
  year: number;
}
interface ApiPointTransaction {
  id: number;
  change_amount: number;
  reason: string;
  note?: string | null;
  created_at: string;
}

const PointUsageHistory = () => {
  const [activeTab, setActiveTab] = useState<
    "all" | "earned" | "used" | "canceled"
  >("all");
  const { data: user } = useUserStore((state) => state.user);

  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: "포인트 이용내역",
      showBackButton: true, 
    });
  }, [setHeader]);

  const { data: pointsBalance } = useGet<{ balance: number }>(
    ["points-balance", user?.user_id],
    "/api/points/balance",
    { params: { user_id: user?.user_id } },
    { enabled: !!user?.user_id }
  );

  const { data: transactionsData } = useGet<ApiPointTransaction[]>(
    ["points-transactions", user?.user_id, activeTab],
    "/api/points/transactions",
    { params: { user_id: user?.user_id, txn_type: activeTab } },
    { enabled: !!user?.user_id }
  );

  const filteredTransactions = useMemo(() => {
    const items = transactionsData || [];
    return items.map((transaction) => {
      const createdAt = new Date(transaction.created_at);
      const type =
        transaction.reason === "refund"
          ? "canceled"
          : transaction.change_amount >= 0
          ? "earned"
          : "used";
      return {
        id: transaction.id,
        description: transaction.note || transaction.reason,
        note: transaction.note || null,
        type,
        amount: transaction.change_amount,
        date: `${createdAt.getMonth() + 1}월 ${String(createdAt.getDate()).padStart(2, "0")}일 ${String(createdAt.getHours()).padStart(2, "0")}:${String(createdAt.getMinutes()).padStart(2, "0")}`,
        year: createdAt.getFullYear(),
      } as PointTransaction;
    });
  }, [transactionsData]);

  // Group transactions by year
  const groupedTransactions = filteredTransactions.reduce(
    (acc, transaction) => {
      if (!acc[transaction.year]) {
        acc[transaction.year] = [];
      }
      acc[transaction.year].push(transaction);
      return acc;
    },
    {} as Record<number, PointTransaction[]>
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "earned":
        return "적립";
      case "used":
        return "사용";
      case "canceled":
        return "취소";
      default:
        return "";
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "earned":
        return "bg-[#8B5E3C] text-white";
      case "used":
        return "bg-[#C97A50] text-white";
      case "canceled":
        return "bg-[#B94C3C] text-white";
      default:
        return "";
    }
  };

  const tabs = [
    { key: "all", label: "전체" },
    { key: "earned", label: "적립" },
    { key: "used", label: "사용" },
    { key: "canceled", label: "취소" },
  ];

  return (
    <div className="bg-background p-4">
      {/* Header - My Points */}
      <div className="bg-white p-3 rounded-2xl mb-4 border border-border-default">
        <p className="text-[12px] leading-[16px] mb-1">나의 포인트</p>
        <p className="text-base leading-[20px] font-bold text-action-primary">
          {typeof pointsBalance?.balance === "number"
            ? `${pointsBalance.balance.toLocaleString("ko-KR")}원`
            : "0원"}
        </p>
      </div>

      {/* Point Details History Card */}
      <div className="bg-white rounded-2xl p-3 border border-border-default">
        <h2 className="text-base leading-[20px] font-bold text-gray-0 mb-2">
          포인트 상세 내역
        </h2>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`h-7 px-2.5 py-1 rounded-sm text-sm leading-[20px] font-bold cursor-pointer ${
                activeTab === tab.key
                  ? "bg-action-primary text-white"
                  : "text-action-primary border border-action-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
 
        <div className="space-y-6 max-h-[calc(100dvh-360px)] overflow-y-auto">

          {/* if there is no transactions, show the empty state */}
          {Object.entries(groupedTransactions).length === 0 && (
            <div className="flex items-center justify-center h-[100px]">
              <p className="text-sm leading-[20px]">포인트 내역이 없습니다.</p>
            </div>
          )}

          {Object.entries(groupedTransactions)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, yearTransactions]) => (
              <div key={year}>
                {/* Year Separator */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-default"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-[12px] leading-[16px] text-text-secondary">
                      {year}
                    </span>
                  </div>
                </div>

                {/* Transactions for this year */}
                <div className="space-y-3">
                  {yearTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-start justify-between"
                    >
                      <div className="">
                        <div className="flex items-center gap-2">
                          <span className="text-xs leading-[16px] font-bold text-gray-0">
                            {transaction.description}
                          </span>

                          <span
                            className={`px-1 py-0.5 rounded-sm text-[12px] leading-[16px] font-normal ${getTypeStyle(
                              transaction.type
                            )}`}
                          >
                            {getTypeLabel(transaction.type)}
                          </span>
                        </div>
                        <p className="text-[12px] leading-[16px] text-text-secondary">
                          {transaction.date}
                        </p>
                      </div>
                      <div className="text-sm leading-[20px] font-bold text-gray-0">
                        {formatAmount(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PointUsageHistory;
