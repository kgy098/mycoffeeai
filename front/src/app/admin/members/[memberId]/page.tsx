"use client";

import { use } from "react";
import MemberForm from "../_components/MemberForm";

export default function MemberEditPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = use(params);
  return <MemberForm mode="edit" memberId={memberId} />;
}
