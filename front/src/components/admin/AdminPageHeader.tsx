 import React from "react";
 
 type AdminPageHeaderProps = {
   title: string;
   description?: string;
   actions?: React.ReactNode;
 };
 
 export default function AdminPageHeader({
   title,
   description,
   actions,
 }: AdminPageHeaderProps) {
   return (
     <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
       <div>
         <h1 className="text-2xl font-semibold text-white">{title}</h1>
         {description && (
           <p className="mt-1 text-sm text-white/60">{description}</p>
         )}
       </div>
       {actions && <div className="flex items-center gap-2">{actions}</div>}
     </div>
   );
 }
