 import React from "react";
 
 type AdminBadgeTone = "default" | "success" | "warning" | "danger" | "info";
 
 type AdminBadgeProps = {
   label: string;
   tone?: AdminBadgeTone;
 };
 
 const toneClasses: Record<AdminBadgeTone, string> = {
   default: "bg-white/10 text-white/70",
   success: "bg-emerald-500/15 text-emerald-200",
   warning: "bg-amber-500/15 text-amber-200",
   danger: "bg-rose-500/15 text-rose-200",
   info: "bg-sky-500/15 text-sky-200",
 };
 
 export default function AdminBadge({ label, tone = "default" }: AdminBadgeProps) {
   return (
     <span
       className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
     >
       {label}
     </span>
   );
 }
