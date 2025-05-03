// app/routes/auth/$.ts
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {prisma} from "../lib/prisma.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // This is redundant now since our custom storage handles it,
  // but good for explicit confirmation
  await prisma.shop.upsert({
    where: { shopDomain: session.shop },
    update: { 
      accessToken: session.accessToken,
      updatedAt: new Date()
    },
    create: { 
      shopDomain: session.shop,
      accessToken: session.accessToken
    }
  });

  return null;
};