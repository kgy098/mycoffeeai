 import MemberForm from "../_components/MemberForm";
 
 export default function MemberEditPage({
   params,
 }: {
   params: { memberId: string };
 }) {
   return <MemberForm mode="edit" memberId={params.memberId} />;
 }
