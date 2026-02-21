 import React from "react";

 type AdminTableProps = {
   columns: string[];
   rows: React.ReactNode[][];
   emptyMessage?: string;
   onRowClick?: (rowIndex: number) => void;
 };

 export default function AdminTable({
   columns,
   rows,
   emptyMessage = "표시할 데이터가 없습니다.",
   onRowClick,
 }: AdminTableProps) {
   return (
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
           {rows.length === 0 ? (
             <tr>
               <td
                 colSpan={columns.length}
                 className="px-4 py-10 text-center text-sm text-white/60"
               >
                 {emptyMessage}
               </td>
             </tr>
           ) : (
             rows.map((row, rowIndex) => (
               <tr
                 key={`row-${rowIndex}`}
                 className={`border-t border-white/5${onRowClick ? " cursor-pointer hover:bg-white/5 transition" : ""}`}
                 onClick={onRowClick ? () => onRowClick(rowIndex) : undefined}
               >
                 {row.map((cell, cellIndex) => (
                   <td key={`cell-${rowIndex}-${cellIndex}`} className="px-4 py-3">
                     {cell}
                   </td>
                 ))}
               </tr>
             ))
           )}
         </tbody>
       </table>
     </div>
   );
 }
