"use client";

import Link from "next/link";
import { useState } from "react";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

const CATEGORIES = ["커피스토리", "커피꿀팁", "이벤트", "이달의커피"];

type PostItem = {
  id: number;
  category: string;
  title: string;
  thumbnail_url?: string | null;
  created_at: string;
  status: string;
};

export default function PostsPage() {
  const [category, setCategory] = useState("");

  const { data: posts = [], isLoading, error } = useGet<PostItem[]>(
    ["admin-posts", category],
    "/api/admin/posts",
    { params: { category: category || undefined } },
    { refetchOnWindowFocus: false }
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="게시글 관리"
        description="커뮤니티 게시글을 등록하고 관리합니다."
        actions={
          <Link
            href="/admin/posts/new"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#101010]"
          >
            게시글 등록
          </Link>
        }
      />

      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-28">
            <label className="text-xs text-white/60">구분</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">전체</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <AdminTable
        columns={["ID", "구분", "썸네일", "제목", "등록일", "상태", "관리"]}
        rows={
          isLoading
            ? []
            : posts.map((post) => [
                post.id,
                <AdminBadge
                  key={`${post.category}-${post.id}-cat`}
                  label={post.category}
                  tone={
                    post.category === "이벤트"
                      ? "warning"
                      : post.category === "이달의커피"
                      ? "info"
                      : "default"
                  }
                />,
                post.thumbnail_url ? (
                  <img
                    key={`${post.category}-${post.id}-thumb`}
                    src={post.thumbnail_url}
                    alt=""
                    className="h-8 w-8 rounded border border-white/10 object-cover"
                  />
                ) : (
                  "-"
                ),
                post.title,
                new Date(post.created_at).toLocaleDateString(),
                <AdminBadge
                  key={`${post.category}-${post.id}-status`}
                  label={post.status}
                  tone={post.status === "공개" || post.status === "노출" ? "success" : "info"}
                />,
                <Link
                  key={`${post.category}-${post.id}-link`}
                  href={`/admin/posts/${encodeURIComponent(post.category)}/${post.id}`}
                  className="text-xs text-sky-200 hover:text-sky-100"
                >
                  수정
                </Link>,
              ])
        }
        emptyMessage={
          isLoading
            ? "로딩 중..."
            : error
            ? "게시글 데이터를 불러오지 못했습니다."
            : "게시글이 없습니다."
        }
      />
    </div>
  );
}
