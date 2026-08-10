import type { Payload } from "payload";

import { checkRole } from "@/access/utilities";
import type { User } from "@/payload-types";

import "./index.scss";

const baseClass = "before-dashboard";

const formatINR = (amount: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount / 100);

type Props = {
  user?: User | null;
  payload: Payload;
};

const LIVE_ORDER_STATUSES = ["processing", "completed"];

const LIVE_FULFILLMENT_STATUSES = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const COMMISSION_LEDGER_STATUSES = {
  not_in: ["refunded", "disputed"],
};

export const BeforeDashboard: React.FC<Props> = async ({ user, payload }) => {
  if (!user) return null;

  const isAdmin = checkRole(["admin"], user);

  if (isAdmin) {
    const orderWhere = { status: { in: LIVE_ORDER_STATUSES } };

    const [orderCount, orderDocs, commissionDocs] = await Promise.all([
      payload.count({
        collection: "orders",
        where: orderWhere,
        overrideAccess: false,
        user,
      }),
      payload.find({
        collection: "orders",
        depth: 0,
        limit: 0,
        pagination: false,
        select: { amount: true },
        where: orderWhere,
        overrideAccess: false,
        user,
      }),
      payload.find({
        collection: "commissions",
        depth: 0,
        limit: 0,
        pagination: false,
        select: { commissionAmount: true },
        where: { status: COMMISSION_LEDGER_STATUSES },
        overrideAccess: false,
        user,
      }),
    ]);

    const totalRevenue = orderDocs.docs.reduce(
      (sum, order) => sum + (order.amount ?? 0),
      0,
    );

    const totalCommission = commissionDocs.docs.reduce(
      (sum, commission) => sum + (commission.commissionAmount ?? 0),
      0,
    );

    return (
      <div className={baseClass}>
        <h2 className={`${baseClass}__title`}>Platform Overview</h2>
        <div className={`${baseClass}__cards`}>
          <StatCard
            label="Total Orders"
            value={String(orderCount.totalDocs)}
          />
          <StatCard label="Total Revenue" value={formatINR(totalRevenue)} />
          <StatCard
            label="Total Commission"
            value={formatINR(totalCommission)}
          />
        </div>
      </div>
    );
  }

  const tenantIds = (user.tenants ?? [])
    .map((t) => (typeof t.tenant === "string" ? t.tenant : t.tenant?.id))
    .filter((id): id is string => Boolean(id));

  const tenantWhere = {
    tenant: { in: tenantIds },
    status: { in: LIVE_FULFILLMENT_STATUSES },
  };

  const [fulfillmentCount, fulfillmentDocs] = await Promise.all([
    payload.count({
      collection: "fulfillments",
      where: tenantWhere,
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: "fulfillments",
      depth: 0,
      limit: 0,
      pagination: false,
      select: { subtotal: true },
      where: tenantWhere,
      overrideAccess: false,
      user,
    }),
  ]);

  const totalRevenue = fulfillmentDocs.docs.reduce(
    (sum, fulfillment) => sum + (fulfillment.subtotal ?? 0),
    0,
  );

  return (
    <div className={baseClass}>
      <h2 className={`${baseClass}__title`}>Store Overview</h2>
      <div className={`${baseClass}__cards`}>
        <StatCard
          label="Total Orders"
          value={String(fulfillmentCount.totalDocs)}
        />
        <StatCard label="Total Revenue" value={formatINR(totalRevenue)} />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className={`${baseClass}__card`}>
    <span className={`${baseClass}__card-label`}>{label}</span>
    <span className={`${baseClass}__card-value`}>{value}</span>
  </div>
);
