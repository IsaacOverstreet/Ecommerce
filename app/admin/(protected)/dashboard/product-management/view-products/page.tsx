import { ProductFilters } from "@/lib/validators/searchParams";
import { ProductList } from "./components/productList";

import { getProducts } from "./service/viewProductService";

interface prop {
  searchParams: ProductFilters;
}

export default async function ViewProducts({ searchParams }: prop) {
  //This is for SSR. it is not in use to fetch ALLPRODUCTS but it is used to fetch PRODUCTMETA
  const param = await searchParams;
  const payload = {
    page: Number(param.page) || 1,
    limit: Number(param.limit) || 20,
    search: param.search,
    sortBy: param.sortBy,
    stockStatus: param.stockStatus,
    availability: param.availability,
    categoryId: param.categoryId,
  };

  const products = await getProducts(payload);

  if (!products?.meta) {
    return null;
  }
  return <ProductList productMeta={products.meta} />;
}
