"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { useGet } from "@/hooks/useApi";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

type SalesSummary = {
  today_sales: number;
  subscription_ratio: number;
  single_ratio: number;
};

type DailySales = { date: string; total_amount: number };
type MonthlySales = { month: string; total_amount: number };
type YearlySales = { year: string; total_amount: number };
type ProductSales = {
  blend_id: number;
  name: string;
  order_count: number;
  total_amount: number;
};
type TasteDistribution = {
  aroma: number;
  acidity: number;
  sweetness: number;
  body: number;
  nuttiness: number;
};

type SalesPeriod = "daily" | "monthly" | "yearly";

const PIE_COLORS = ["#6366f1", "#f59e0b"];
const BAR_COLOR = "#6366f1";
const PRODUCT_BAR_COLOR = "#10b981";

const periodLabel: Record<SalesPeriod, string> = {
  daily: "일별",
  monthly: "월별",
  yearly: "연별",
};

export default function SalesPage() {
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>("daily");
  const [productPeriod, setProductPeriod] = useState<SalesPeriod>("monthly");

  const { data: summary } = useGet<SalesSummary>(
    ["admin-sales-summary"],
    "/api/admin/sales/summary",
    undefined,
    { refetchOnWindowFocus: false }
  );

  const { data: dailySales = [] } = useGet<DailySales[]>(
    ["admin-sales-daily"],
    "/api/admin/sales/daily",
    undefined,
    { enabled: salesPeriod === "daily", refetchOnWindowFocus: false }
  );

  const { data: monthlySales = [] } = useGet<MonthlySales[]>(
    ["admin-sales-monthly"],
    "/api/admin/sales/monthly",
    undefined,
    { enabled: salesPeriod === "monthly", refetchOnWindowFocus: false }
  );

  const { data: yearlySales = [] } = useGet<YearlySales[]>(
    ["admin-sales-yearly"],
    "/api/admin/sales/yearly",
    undefined,
    { enabled: salesPeriod === "yearly", refetchOnWindowFocus: false }
  );

  const { data: productSales = [] } = useGet<ProductSales[]>(
    ["admin-sales-products", productPeriod],
    "/api/admin/sales/products",
    { params: { period: productPeriod } },
    { refetchOnWindowFocus: false }
  );

  const { data: taste } = useGet<TasteDistribution>(
    ["admin-sales-taste"],
    "/api/admin/sales/taste-distribution",
    undefined,
    { refetchOnWindowFocus: false }
  );

  // --- chart data ---
  const pieData =
    summary
      ? [
          { name: "구독", value: summary.subscription_ratio },
          { name: "단품", value: summary.single_ratio },
        ]
      : [];

  const salesBarData =
    salesPeriod === "daily"
      ? dailySales.map((d) => ({
          label: new Date(d.date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }),
          매출: d.total_amount,
        }))
      : salesPeriod === "monthly"
      ? monthlySales.map((d) => ({ label: d.month, 매출: d.total_amount }))
      : yearlySales.map((d) => ({ label: d.year, 매출: d.total_amount }));

  const productBarData = productSales.map((p) => ({
    name: p.name.length > 8 ? p.name.slice(0, 8) + "…" : p.name,
    주문수: p.order_count,
    매출: p.total_amount,
  }));

  const radarData = taste
    ? [
        { attr: "향", value: taste.aroma },
        { attr: "산미", value: taste.acidity },
        { attr: "단맛", value: taste.sweetness },
        { attr: "바디", value: taste.body },
        { attr: "고소함", value: taste.nuttiness },
      ]
    : [];

  const formatKrw = (v: number) =>
    v >= 10000 ? `${(v / 10000).toFixed(0)}만` : v.toLocaleString();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="판매 통계"
        description="기간별 매출과 인기 상품 지표를 확인합니다."
      />

      {/* 상단: 오늘 매출 + 구독/단품 비중 원그래프 */}
      <div className="grid gap-4 md:grid-cols-2">
        <AdminStatCard
          label="오늘 매출"
          value={`${Number(summary?.today_sales || 0).toLocaleString()}원`}
          description="실시간 집계"
        />
        <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
          <p className="text-xs text-white/60">구독 / 단품 비중</p>
          <p className="mt-1 text-xs text-white/40">최근 30일</p>
          {pieData.length > 0 && (pieData[0].value > 0 || pieData[1].value > 0) ? (
            <div className="mt-2 h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value: number) => `${value}%`}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-8 text-center text-xs text-white/40">데이터가 없습니다.</p>
          )}
        </div>
      </div>

      {/* 기간별 매출 현황 (막대 그래프) */}
      <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">기간별 매출 현황</h3>
          <div className="flex gap-1">
            {(["daily", "monthly", "yearly"] as SalesPeriod[]).map((p) => (
              <button
                key={p}
                className={`rounded-lg px-3 py-1 text-xs ${
                  salesPeriod === p
                    ? "bg-white text-[#101010] font-semibold"
                    : "border border-white/10 text-white/60 hover:bg-white/5"
                }`}
                onClick={() => setSalesPeriod(p)}
              >
                {periodLabel[p]}
              </button>
            ))}
          </div>
        </div>
        {salesBarData.length > 0 ? (
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickFormatter={formatKrw}
                />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value: number) => `${value.toLocaleString()}원`}
                />
                <Bar dataKey="매출" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-8 text-center text-xs text-white/40">매출 데이터가 없습니다.</p>
        )}
      </div>

      {/* 상품별 매출 현황 (막대 그래프) */}
      <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">상품별 매출 현황</h3>
          <div className="flex gap-1">
            {(["daily", "monthly", "yearly"] as SalesPeriod[]).map((p) => (
              <button
                key={p}
                className={`rounded-lg px-3 py-1 text-xs ${
                  productPeriod === p
                    ? "bg-white text-[#101010] font-semibold"
                    : "border border-white/10 text-white/60 hover:bg-white/5"
                }`}
                onClick={() => setProductPeriod(p)}
              >
                {periodLabel[p]}
              </button>
            ))}
          </div>
        </div>
        {productBarData.length > 0 ? (
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  type="number"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value: number, name: string) =>
                    name === "매출" ? `${value.toLocaleString()}원` : `${value}건`
                  }
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }} />
                <Bar dataKey="주문수" fill={PRODUCT_BAR_COLOR} radius={[0, 4, 4, 0]} />
                <Bar dataKey="매출" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-8 text-center text-xs text-white/40">상품별 매출 데이터가 없습니다.</p>
        )}
      </div>

      {/* 취향 분포도 (레이더 차트) */}
      <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
        <h3 className="text-sm font-semibold text-white">취향 분포도</h3>
        {radarData.length > 0 ? (
          <div className="mt-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="attr"
                  tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 5]}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="평균 점수"
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value: number) => value.toFixed(1)}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-8 text-center text-xs text-white/40">데이터가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
