 import React from "react";
 
 type AdminStatCardProps = {
   label: string;
   value: string;
   description?: string;
 };
 
 export default function AdminStatCard({
   label,
   value,
   description,
 }: AdminStatCardProps) {
   return (
     <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
       <p className="text-xs text-white/60">{label}</p>
       <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
       {description && (
         <p className="mt-2 text-xs text-white/50">{description}</p>
       )}
     </div>
   );
 }
