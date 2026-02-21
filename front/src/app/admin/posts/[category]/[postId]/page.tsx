"use client";

import PostForm from "../../_components/PostForm";

export default function EditPostPage({
  params,
}: {
  params: { category: string; postId: string };
}) {
  return (
    <PostForm
      mode="edit"
      category={decodeURIComponent(params.category)}
      postId={params.postId}
    />
  );
}
