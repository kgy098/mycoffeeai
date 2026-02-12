 import ProductForm from "../_components/ProductForm";
 
 export default function ProductEditPage({
   params,
 }: {
   params: { productId: string };
 }) {
   return <ProductForm mode="edit" productId={params.productId} />;
 }
