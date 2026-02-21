"use client";

import { use } from "react";
import PostForm from "../../_components/PostForm";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ category: string; postId: string }>;
}) {
  const { category, postId } = use(params);
  return (
    <PostForm
      mode="edit"
      category={decodeURIComponent(category)}
      postId={postId}
    />
  );
}
