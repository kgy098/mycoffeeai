"use client";

import Link from "next/link";
import { useState } from "react";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";
import { api } from "@/lib/api";

 type Blend = {
   id: number;
   name: string;
   aroma?: number;
   acidity?: number;
   sweetness?: number;
   body?: number;
   nuttiness?: number;
   price?: number | null;
   stock?: number | null;
   status?: string; // 1=판매중, 2=일시중지, 3=품절
   created_at?: string;
 };

 type EditingState = {
   aroma: string;
   acidity: string;
   sweetness: string;
   body: string;
   nuttiness: string;
   price: string;
   stock: string;
   status: string;
 };

 export default function ProductsListPage() {
   const [search, setSearch] = useState("");
  const [saleStatus, setSaleStatus] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditingState | null>(null);
  const [saving, setSaving] = useState(false);
  const { data: rawBlends, isLoading, error, refetch } = useGet<Blend[] | { data?: Blend[] }>(
    ["admin-blends", search],
    "/api/admin/blends",
    {
      params: {
        skip: 0,
        limit: 50,
        q: search || undefined,
        status: saleStatus || undefined,
      },
    },
    { refetchOnWindowFocus: false, retry: 0 }
  );

  const blends = Array.isArray(rawBlends) ? rawBlends : (rawBlends as any)?.data ?? [];
  const filtered = blends;

  const startEdit = (product: Blend) => {
    setEditingId(product.id);
    setEditForm({
      aroma: String(product.aroma ?? ""),
      acidity: String(product.acidity ?? ""),
      sweetness: String(product.sweetness ?? ""),
      body: String(product.body ?? ""),
      nuttiness: String(product.nuttiness ?? ""),
      price: product.price != null ? String(product.price) : "",
      stock: product.stock != null ? String(product.stock) : "",
      status: product.status ?? "1",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = async (productId: number) => {
    if (!editForm) return;
    setSaving(true);
    try {
      await api.put(`/api/admin/blends/${productId}`, {
        aroma: Number(editForm.aroma) || 0,
        acidity: Number(editForm.acidity) || 0,
        sweetness: Number(editForm.sweetness) || 0,
        body: Number(editForm.body) || 0,
        nuttiness: Number(editForm.nuttiness) || 0,
        price: editForm.price ? Number(editForm.price) : null,
        stock: editForm.stock ? Number(editForm.stock) : 0,
        status: editForm.status,
      });
      setEditingId(null);
      setEditForm(null);
      refetch();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-10 rounded border border-white/10 bg-[#1a1a1a] px-1 py-0.5 text-xs text-white/80 text-center";

  const errorStatus = (error as any)?.response?.status;
  const errorDetail = (error as any)?.response?.data?.detail ?? (error as any)?.message;
  const isAuthError = errorStatus === 401 || errorStatus === 403;
 
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="커피 상품"
         description="상품 정보를 등록하고 판매 상태를 관리합니다."
         resultCount={filtered.length}
         actions={
           <Link
             href="/admin/products/new"
             className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#101010]"
           >
             상품 등록
           </Link>
         }
       />
 
       <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-28">
             <label className="text-xs text-white/60">판매 상태</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={saleStatus}
              onChange={(event) => setSaleStatus(event.target.value)}
            >
              <option value="">전체</option>
              <option value="1">판매중</option>
              <option value="2">일시중지</option>
              <option value="3">품절</option>
            </select>
           </div>
           <div className="min-w-[120px] flex-1">
             <label className="text-xs text-white/60">검색</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
               placeholder="상품명을 입력하세요"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
             />
           </div>
           <button className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#101010]">
             검색
           </button>
          <button
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70"
            onClick={() => {
              setSearch("");
              setSaleStatus("");
            }}
          >
             초기화
           </button>
         </div>
       </div>
 
       {error && (
         <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
           <p className="font-semibold">상품 데이터를 불러오지 못했습니다.</p>
           {errorStatus && <p>HTTP {errorStatus}</p>}
           {errorDetail && <p>{typeof errorDetail === "string" ? errorDetail : JSON.stringify(errorDetail)}</p>}
           {isAuthError && (
             <p className="mt-2 text-xs text-white/80">
               관리자 계정으로 로그인했는지 확인하세요. 로그아웃 후 관리자 계정으로 다시 로그인해 보세요.
             </p>
           )}
           <button
             type="button"
             onClick={() => refetch()}
             className="mt-3 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/30"
           >
             다시 시도
           </button>
         </div>
       )}

       <AdminTable
         columns={[
           "상품명",
           "맛 프로파일",
           "가격",
           "재고상태",
           "상태",
           "등록일",
           "관리",
         ]}
        rows={
          isLoading
            ? []
            : filtered.map((product) => {
                const isEditing = editingId === product.id && editForm;
                return [
                  product.name,
                  isEditing ? (
                    <div key={`${product.id}-profile`} className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-white/50">향</span>
                      <input className={inputCls} value={editForm.aroma} onChange={(e) => setEditForm({ ...editForm, aroma: e.target.value })} />
                      <span className="text-[10px] text-white/50">산미</span>
                      <input className={inputCls} value={editForm.acidity} onChange={(e) => setEditForm({ ...editForm, acidity: e.target.value })} />
                      <span className="text-[10px] text-white/50">단맛</span>
                      <input className={inputCls} value={editForm.sweetness} onChange={(e) => setEditForm({ ...editForm, sweetness: e.target.value })} />
                      <span className="text-[10px] text-white/50">바디</span>
                      <input className={inputCls} value={editForm.body} onChange={(e) => setEditForm({ ...editForm, body: e.target.value })} />
                      <span className="text-[10px] text-white/50">고소함</span>
                      <input className={inputCls} value={editForm.nuttiness} onChange={(e) => setEditForm({ ...editForm, nuttiness: e.target.value })} />
                    </div>
                  ) : (
                    `향 ${product.aroma ?? "-"} · 산미 ${product.acidity ?? "-"} · 단맛 ${
                      product.sweetness ?? "-"
                    } · 바디 ${product.body ?? "-"} · 고소함 ${product.nuttiness ?? "-"}`
                  ),
                  isEditing ? (
                    <input
                      key={`${product.id}-price`}
                      className="w-20 rounded border border-white/10 bg-[#1a1a1a] px-2 py-0.5 text-xs text-white/80 text-right"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      placeholder="가격"
                    />
                  ) : (
                    product.price ? `${Number(product.price).toLocaleString()}원` : "-"
                  ),
                  isEditing ? (
                    <input
                      key={`${product.id}-stock`}
                      className="w-16 rounded border border-white/10 bg-[#1a1a1a] px-2 py-0.5 text-xs text-white/80 text-right"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      placeholder="재고"
                    />
                  ) : (
                    product.stock ?? "-"
                  ),
                  isEditing ? (
                    <select
                      key={`${product.id}-status-edit`}
                      className="rounded border border-white/10 bg-[#1a1a1a] px-1 py-0.5 text-xs text-white/80"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="1">판매중</option>
                      <option value="2">일시중지</option>
                      <option value="3">품절</option>
                    </select>
                  ) : (
                    <AdminBadge
                      key={`${product.id}-status`}
                      label={product.status === "1" ? "판매중" : product.status === "2" ? "일시중지" : "품절"}
                      tone={product.status === "1" ? "success" : product.status === "2" ? "warning" : "danger"}
                    />
                  ),
                  product.created_at ? new Date(product.created_at).toLocaleDateString() : "-",
                  isEditing ? (
                    <div key={`${product.id}-actions`} className="flex items-center gap-1">
                      <button
                        className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-40"
                        onClick={() => saveEdit(product.id)}
                        disabled={saving}
                      >
                        {saving ? "저장중" : "저장"}
                      </button>
                      <button
                        className="rounded border border-white/20 px-2 py-1 text-[11px] text-white/60"
                        onClick={cancelEdit}
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div key={`${product.id}-actions`} className="flex items-center gap-1">
                      <button
                        className="text-xs text-amber-300 hover:text-amber-200"
                        onClick={() => startEdit(product)}
                      >
                        수정
                      </button>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-xs text-sky-200 hover:text-sky-100"
                      >
                        상세
                      </Link>
                    </div>
                  ),
                ];
              })
        }
        emptyMessage={
          isLoading
            ? "로딩 중..."
            : error
            ? ""
            : "등록된 상품이 없습니다."
        }
       />
     </div>
   );
 }
