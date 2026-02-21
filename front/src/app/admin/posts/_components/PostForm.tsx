"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useGet, usePost, usePut } from "@/hooks/useApi";
import { api } from "@/lib/api";

const CATEGORIES = ["커피스토리", "커피꿀팁", "이벤트", "이달의커피"];

type PostFormProps = {
  mode: "create" | "edit";
  category?: string;
  postId?: string;
};

type PostDetail = {
  id: number;
  category: string;
  title: string;
  content: string;
  thumbnail_url?: string | null;
  status: string;
  detail_image_url?: string | null;
  reward_points?: number | null;
  blend_id?: number | null;
  month?: string | null;
  banner_url?: string | null;
};

type BlendOption = {
  id: number;
  name: string;
};

export default function PostForm({ mode, category: initCategory, postId }: PostFormProps) {
  const router = useRouter();
  const [category, setCategory] = useState(initCategory || "커피스토리");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [postStatus, setPostStatus] = useState("공개");
  const [detailImageUrl, setDetailImageUrl] = useState("");
  const [rewardPoints, setRewardPoints] = useState("0");
  const [blendId, setBlendId] = useState("");
  const [month, setMonth] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailFileInputRef = useRef<HTMLInputElement>(null);

  const { data: post } = useGet<PostDetail>(
    ["admin-post", initCategory, postId],
    `/api/admin/posts/${encodeURIComponent(initCategory || "")}/${postId}`,
    undefined,
    { enabled: mode === "edit" && Boolean(postId && initCategory) }
  );

  const { data: blends = [] } = useGet<BlendOption[]>(
    ["admin-blends-options"],
    "/api/admin/blends",
    { params: { limit: 200 } },
    { enabled: category === "이달의커피" }
  );

  const { mutate: createPost, isPending: isCreating } = usePost(
    "/api/admin/posts",
    {
      onSuccess: () => {
        setMessage("등록되었습니다.");
        setTimeout(() => router.push("/admin/posts"), 1000);
      },
      onError: (err: any) =>
        setMessage(err?.response?.data?.detail || "등록에 실패했습니다."),
    }
  );

  const { mutate: updatePost, isPending: isUpdating } = usePut(
    `/api/admin/posts/${encodeURIComponent(initCategory || "")}/${postId}`,
    {
      onSuccess: () => setMessage("수정되었습니다."),
      onError: (err: any) =>
        setMessage(err?.response?.data?.detail || "수정에 실패했습니다."),
    }
  );

  useEffect(() => {
    if (!post) return;
    setCategory(post.category);
    setTitle(post.title);
    setContent(post.content);
    setThumbnailUrl(post.thumbnail_url || "");
    setPostStatus(post.status);
    setDetailImageUrl(post.detail_image_url || "");
    setRewardPoints(String(post.reward_points ?? "0"));
    setBlendId(post.blend_id ? String(post.blend_id) : "");
    setMonth(post.month || "");
  }, [post]);

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post<{ url: string }>("/api/uploads/post", formData);
      setter(res.data.url);
    } catch {
      setMessage("이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const submit = () => {
    setMessage(null);
    if (!title) {
      setMessage("제목을 입력해주세요.");
      return;
    }

    const payload: any = {
      category,
      title,
      content,
      thumbnail_url: thumbnailUrl || null,
      status: postStatus,
    };

    if (category === "이벤트") {
      payload.detail_image_url = detailImageUrl || null;
      payload.reward_points = Number(rewardPoints) || 0;
    }

    if (category === "이달의커피") {
      payload.blend_id = blendId ? Number(blendId) : null;
      payload.month = month || null;
    }

    if (mode === "create") {
      createPost(payload);
    } else {
      updatePost(payload);
    }
  };

  const isEvent = category === "이벤트";
  const isMonthly = category === "이달의커피";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={mode === "create" ? "게시글 등록" : "게시글 수정"}
        description="게시글 정보를 입력합니다."
        actions={
          <Link
            href="/admin/posts"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70"
          >
            목록으로
          </Link>
        }
      />

      <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-white/60">구분</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={mode === "edit"}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/60">상태</label>
            {isMonthly ? (
              <select
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
                value={postStatus}
                onChange={(e) => setPostStatus(e.target.value)}
              >
                <option value="노출">노출</option>
                <option value="미노출">미노출</option>
              </select>
            ) : (
              <select
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
                value={postStatus}
                onChange={(e) => setPostStatus(e.target.value)}
              >
                <option value="공개">공개</option>
                <option value="진행중">진행중</option>
                <option value="종료">종료</option>
              </select>
            )}
          </div>

          {isMonthly && (
            <>
              <div>
                <label className="text-xs text-white/60">커피 상품</label>
                <select
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
                  value={blendId}
                  onChange={(e) => setBlendId(e.target.value)}
                >
                  <option value="">선택</option>
                  {blends.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/60">월 (YYYY-MM-DD)</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <label className="text-xs text-white/60">
              {isMonthly ? "한줄평" : "제목"}
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-white/60">내용</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
              rows={8}
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* 썸네일 업로드 */}
          <div className="md:col-span-2">
            <label className="text-xs text-white/60">썸네일 이미지</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleUpload(e, setThumbnailUrl)}
              />
              <button
                type="button"
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:border-white/30"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "업로드 중..." : "파일 선택"}
              </button>
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="썸네일"
                  className="h-10 w-10 rounded-lg border border-white/10 object-cover"
                />
              )}
              {thumbnailUrl && (
                <span className="truncate text-xs text-white/40 max-w-[200px]">
                  {thumbnailUrl}
                </span>
              )}
            </div>
          </div>

          {/* 이벤트 전용: 상세 이미지 */}
          {isEvent && (
            <>
              <div className="md:col-span-2">
                <label className="text-xs text-white/60">상세 이미지</label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    ref={detailFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => handleUpload(e, setDetailImageUrl)}
                  />
                  <button
                    type="button"
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:border-white/30"
                    onClick={() => detailFileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "업로드 중..." : "파일 선택"}
                  </button>
                  {detailImageUrl && (
                    <img
                      src={detailImageUrl}
                      alt="상세 이미지"
                      className="h-10 w-10 rounded-lg border border-white/10 object-cover"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/60">리워드 포인트</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-[#101010]"
            onClick={submit}
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating
              ? "저장 중..."
              : mode === "create"
              ? "등록"
              : "수정"}
          </button>
          <Link
            href="/admin/posts"
            className="rounded-lg border border-white/20 px-5 py-2 text-sm text-white/70"
          >
            목록으로
          </Link>
        </div>

        {message && <p className="mt-4 text-xs text-white/60">{message}</p>}
      </div>
    </div>
  );
}
