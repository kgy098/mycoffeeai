"use client";
import React, { useEffect } from "react";
import { useHeaderStore } from "@/stores/header-store";

export default function ReturnRequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: "반품하기",
      showBackButton: true,
    });
  }, []);

  return (
    <>
      {children}
    </>
  );
}
