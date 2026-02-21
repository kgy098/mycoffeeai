"use client";

import { use } from "react";
import ProductForm from "../_components/ProductForm";

export default function ProductEditPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  return <ProductForm mode="edit" productId={productId} />;
}
