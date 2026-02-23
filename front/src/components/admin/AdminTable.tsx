 import React, { useState } from "react";

 type AdminTableProps = {
   columns: string[];
   rows: React.ReactNode[][];
   emptyMessage?: string;
   onRowClick?: (rowIndex: number) => void;
   pageSize?: number;
   /** server-side pagination: total item count from API */
   totalItems?: number;
   /** server-side pagination: current page (0-indexed) */
   currentPage?: number;
   /** server-side pagination: callback when page changes */
   onPageChange?: (page: number) => void;
 };

 export default function AdminTable({
   columns,
   rows,
   emptyMessage = "표시할 데이터가 없습니다.",
   onRowClick,
   pageSize = 10,
   totalItems,
   currentPage,
   onPageChange,
 }: AdminTableProps) {
   const [internalPage, setInternalPage] = useState(0);

   const isServerSide = totalItems !== undefined && onPageChange !== undefined;
   const page = isServerSide ? (currentPage ?? 0) : internalPage;
   const setPage = isServerSide ? onPageChange! : setInternalPage;
   const totalCount = isServerSide ? totalItems : rows.length;

   const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
   const safeePage = Math.min(page, totalPages - 1);
   const pagedRows = isServerSide ? rows : rows.slice(safeePage * pageSize, (safeePage + 1) * pageSize);

   return (
     <div>
       <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#141414]">
         <table className="min-w-full text-sm">
           <thead className="bg-white/5 text-white/70">
             <tr>
               {columns.map((column) => (
                 <th
                   key={column}
                   className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                 >
                   {column}
                 </th>
               ))}
             </tr>
           </thead>
           <tbody className="text-white/80">
             {pagedRows.length === 0 ? (
               <tr>
                 <td
                   colSpan={columns.length}
                   className="px-4 py-10 text-center text-sm text-white/60"
                 >
                   {emptyMessage}
                 </td>
               </tr>
             ) : (
               pagedRows.map((row, localIndex) => {
                 const globalIndex = safeePage * pageSize + localIndex;
                 return (
                   <tr
                     key={`row-${globalIndex}`}
                     className={`border-t border-white/5${onRowClick ? " cursor-pointer hover:bg-white/5 transition" : ""}`}
                     onClick={onRowClick ? () => onRowClick(globalIndex) : undefined}
                   >
                     {row.map((cell, cellIndex) => (
                       <td key={`cell-${globalIndex}-${cellIndex}`} className="px-4 py-3">
                         {cell}
                       </td>
                     ))}
                   </tr>
                 );
               })
             )}
           </tbody>
         </table>
       </div>

       {totalCount > 0 && (
         <div className="mt-3 flex items-center justify-start gap-3 text-xs text-white/60">
           <span>
             총 {totalCount}건 중 {safeePage * pageSize + 1}-{Math.min((safeePage + 1) * pageSize, totalCount)}건
           </span>
           {totalPages > 1 && (
             <div className="flex items-center gap-1">
               <button
                 onClick={() => setPage(0)}
                 disabled={safeePage === 0}
                 className="rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30"
               >
                 «
               </button>
               <button
                 onClick={() => setPage(Math.max(0, safeePage - 1))}
                 disabled={safeePage === 0}
                 className="rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30"
               >
                 ‹
               </button>
               {Array.from({ length: totalPages }, (_, i) => i)
                 .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - safeePage) <= 2)
                 .reduce<number[]>((acc, i) => {
                   if (acc.length > 0 && i - acc[acc.length - 1] > 1) acc.push(-1);
                   acc.push(i);
                   return acc;
                 }, [])
                 .map((i, idx) =>
                   i === -1 ? (
                     <span key={`dot-${idx}`} className="px-1">…</span>
                   ) : (
                     <button
                       key={i}
                       onClick={() => setPage(i)}
                       className={`rounded px-2 py-1 ${
                         i === safeePage
                           ? "bg-white/20 text-white font-semibold"
                           : "hover:bg-white/10"
                       }`}
                     >
                       {i + 1}
                     </button>
                   )
                 )}
               <button
                 onClick={() => setPage(Math.min(totalPages - 1, safeePage + 1))}
                 disabled={safeePage >= totalPages - 1}
                 className="rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30"
               >
                 ›
               </button>
               <button
                 onClick={() => setPage(totalPages - 1)}
                 disabled={safeePage >= totalPages - 1}
                 className="rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30"
               >
                 »
               </button>
             </div>
           )}
         </div>
       )}
     </div>
   );
 }
