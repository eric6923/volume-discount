// import { json, LoaderFunctionArgs } from "@remix-run/node";
// import { useLoaderData } from "@remix-run/react";
// import { prisma } from "../lib/prisma.server";

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   const url = new URL(request.url);
//   const shopDomain = url.searchParams.get("shop");

//   if (!shopDomain) {
//     throw new Response("Missing shop parameter", { status: 400 });
//   }

//   const shop = await prisma.shop.findUnique({
//     where: { shopDomain },
//     include: {
//       volumeDiscounts: true, // get volume discounts for this shop
//     },
//   });

//   if (!shop) {
//     throw new Response("Shop not found", { status: 404 });
//   }

//   return json({ shop });
// };

export default function AppDashboard() {
  // const { shop } = useLoaderData<typeof loader>();

  return (
    // <div className="max-w-3xl mx-auto p-6">
    //   <h1 className="text-3xl font-bold mb-4">Welcome, {shop.shopDomain}</h1>
    //   <p className="text-gray-500 mb-6">Access Token: <code>{shop.accessToken}</code></p>

    //   <h2 className="text-2xl font-semibold mb-2">Volume Discounts</h2>
    //   <div className="space-y-4">
    //     {shop.volumeDiscounts.length === 0 ? (
    //       <p className="text-gray-500">No volume discounts yet.</p>
    //     ) : (
    //       shop.volumeDiscounts.map((discount: any) => (
    //         <div key={discount.id} className="border p-4 rounded shadow">
    //           <h3 className="text-lg font-semibold">{discount.title}</h3>
    //           <p className="text-sm text-gray-600">Product ID: {discount.productId}</p>
    //           <p className="text-sm text-gray-600">Tiers: {JSON.stringify(discount.tiers)}</p>
    //         </div>
    //       ))
    //     )}
    //   </div>
    // </div>
    <></>
  );
}
