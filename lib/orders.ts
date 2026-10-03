import { PAYMENTS } from "./data";
import { Order, lineInfo } from "./store";

export const payLabel = (o: Order) =>
  o.payment === "cod" ? `Cash on Delivery${o.paid ? " (collected)" : ""}` : `${PAYMENTS.find((p) => p.id === o.payment)?.name} (paid)`;

export const orderItems = (o: Order) => o.lines.map((l) => `${lineInfo(l).name} × ${l.qty}`).join(", ");
