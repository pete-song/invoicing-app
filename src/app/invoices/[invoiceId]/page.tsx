import { db } from "@/db";
import { Invoices, Customers } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Invoice from "./Invoice";

interface InvoicePageProps {
  params: { invoiceId: string };
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { userId, orgId } = await auth();
  if (!userId) return;
  const invoiceId = parseInt(params.invoiceId);

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

  if (isNaN(invoiceId)) {
    throw new Error("Invalid Invoice ID");
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
