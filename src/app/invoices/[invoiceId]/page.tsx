import { db } from "@/db";
import { Invoices, Customers } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Invoice from "./Invoice";

export default async function InvoicePage({
  params,
}: { params: { invoiceId: string } }) {
  // console.log("Params type:", typeof params);
  // console.log("Params value:", params);

  const { userId, orgId } = await auth();

  if (!userId) return;
  
  const resolvedParams = await params;
  const invoiceId = Number.parseInt(resolvedParams.invoiceId);

  if (Number.isNaN(invoiceId)) {
    throw new Error("Invalid Invoice ID");
  }

  let result;
  if (orgId) {
    [result] = await db
      .select()
      .from(Invoices)
      .innerJoin(Customers, eq(Invoices.customerId, Customers.id))
      .where(
        and(eq(Invoices.id, invoiceId), eq(Invoices.organizationId, orgId)),
      )
      .limit(1);
  } else {
    [result] = await db
      .select()
      .from(Invoices)
      .innerJoin(Customers, eq(Invoices.customerId, Customers.id))
      .where(
        and(
          eq(Invoices.id, invoiceId),
          eq(Invoices.userId, userId),
          isNull(Invoices.organizationId),
        ),
      )
      .limit(1);
  }

  if (!result) {
    notFound();
  }

  const invoice = {
    ...result.invoices,
    customer: result.customers,
  };

  return <Invoice invoice={invoice} />;
}
