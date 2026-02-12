 "use client";
 
 import React from "react";
 import { usePathname } from "next/navigation";
 
 type AppFrameProps = {
   children: React.ReactNode;
 };
 
 export default function AppFrame({ children }: AppFrameProps) {
   const pathname = usePathname();
   const isAdminRoute = pathname?.startsWith("/admin");
 
   if (isAdminRoute) {
     return <div className="w-full min-h-[100dvh]">{children}</div>;
   }
 
   return (
     <div className="w-full min-h-[100dvh] sm:max-w-sm sm:mx-auto bg-background">
       {children}
     </div>
   );
 }
