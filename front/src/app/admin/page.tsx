"use client";

import Link from "next/link";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type DashboardStats = {
  today_sales: number;
  today_orders: number;
  today_deliveries: number;
  new_members: number;
  active_users: number;
  shipping_in_progress: number;
};

type MonthlyChart = {
  month: string;
  sales_amount: number;
  order_count: number;
};

type NewMember = {
  id: number;
  name?: string | null;
  provider?: string | null;
  created_at: string;
};

type PopularCoffee = {
  blend_id: number;
  name: string;
  order_count: number;
};

export default function AdminDashboardPage() {
  const { data: stats } = useGet<DashboardStats>(
    ["admin-dashboard-stats"],
    "/api/admin/dashboard/stats",
    undefined,
    { refetchOnWindowFocus: false }
  );
  const { data: monthlyChart = [] } = useGet<MonthlyChart[]>(
    ["admin-dashboard-monthly-chart"],
    "/api/admin/dashboard/monthly-chart",
    undefined,
    { refetchOnWindowFocus: false }
  );
  const { data: newMembers = [] } = useGet<NewMember[]>(
    ["admin-dashboard-new-members"],
    "/api/admin/dashboard/new-members",
    undefined,
    { refetchOnWindowFocus: false }
  );
  const { data: popularCoffee = [] } = useGet<PopularCoffee[]>(
    ["admin-dashboard-popular-coffee"],
    "/api/admin/dashboard/popular-coffee",
    undefined,
    { refetchOnWindowFocus: false }
  );

  const formatAmount = (value: number) => {
    if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}천`;
    return value.toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* Header with inline stats */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">대시보드</h1>
          <p className="mt-1 text-sm text-white/60">
            운영 현황을 빠르게 확인하세요.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#141414] px-3 py-2">
              <span className="text-xs text-white/50">신규 가입</span>
              <span className="text-sm font-semibold text-white">
                {stats?.new_members || 0}명
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#141414] px-3 py-2">
              <span className="text-xs text-white/50">활성 사용자</span>
              <span className="text-sm font-semibold text-white">
                {stats?.active_users || 0}명
              </span>
            </div>
          </div>
          <p className="text-[11px] text-white/40">
            * 활성 사용자: 최근 7일 이내 로그인한 회원 수
          </p>
        </div>
      </div>

      {/* Today's key metrics */}
      <section className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          label="오늘 주문건수"
          value={`${stats?.today_orders || 0}건`}
          description="오늘 접수된 주문"
        />
        <AdminStatCard
          label="오늘 배송건수"
          value={`${stats?.today_deliveries || 0}건`}
          description="오늘 출고/배송된 건수"
        />
        <AdminStatCard
          label="오늘 매출"
          value={`${Number(stats?.today_sales || 0).toLocaleString()}원`}
          description={`${new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(/\.$/, "")} 기준`}
        />
      </section>

      {/* 3-month charts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/orders"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 hover:border-white/30"
          >
            주문 내역 보기
          </Link>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
        {/* Monthly Sales Chart */}
        <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">
            최근 3개월 매출 현황
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#aaa", fontSize: 12 }}
                  axisLine={{ stroke: "#444" }}
                />
                <YAxis
                  tick={{ fill: "#aaa", fontSize: 12 }}
                  axisLine={{ stroke: "#444" }}
                  tickFormatter={formatAmount}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()}원`,
                    "매출",
                  ]}
                />
                <Bar
                  dataKey="sales_amount"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={80}
                  name="매출"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Order Count Chart */}
        <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">
            최근 3개월 판매 현황
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#aaa", fontSize: 12 }}
                  axisLine={{ stroke: "#444" }}
                />
                <YAxis
                  tick={{ fill: "#aaa", fontSize: 12 }}
                  axisLine={{ stroke: "#444" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()}건`,
                    "주문수",
                  ]}
                />
                <Bar
                  dataKey="order_count"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={80}
                  name="주문수"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
      </section>

      {/* New Members & Popular Coffee */}
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">신규 가입 회원</h2>
            <Link
              href="/admin/members"
              className="text-xs text-white/60 hover:text-white"
            >
              회원 전체보기
            </Link>
          </div>
          <AdminTable
            columns={["이름", "가입일시", "가입채널", "상태"]}
            rows={newMembers.map((member) => [
              member.name || `회원 #${member.id}`,
              new Date(member.created_at).toLocaleString(),
              member.provider || "-",
              <AdminBadge
                key={`${member.id}-status`}
                label="정상"
                tone="success"
              />,
            ])}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">인기 커피 현황</h2>
            <Link
              href="/admin/products"
              className="text-xs text-white/60 hover:text-white"
            >
              상품 관리로 이동
            </Link>
          </div>
          <AdminTable
            columns={["순위", "커피", "주문수"]}
            rows={popularCoffee.map((item, index) => [
              `${index + 1}위`,
              item.name,
              `${item.order_count}건`,
            ])}
          />
        </div>
      </section>
    </div>
  );
}
