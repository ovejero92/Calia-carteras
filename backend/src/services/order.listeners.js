import { orderEvents } from "./order.events.js";
import {
    sendNewOrderToOwner,
    sendOrderAcceptedToClient,
    sendOrderRejectedToClient,
} from "./email.service.js";

let registered = false;

function log(msg, extra = {}) {
    console.log(`[orders] ${msg}`, Object.keys(extra).length ? extra : "");
}

export function registerOrderListeners() {
    if (registered) return;
    registered = true;

    orderEvents.on("order:created", async ({ order, source }) => {
        log("order:created", { id: order?.id, source });
        try {
            await sendNewOrderToOwner(order);
            log("email:new_order_sent", { id: order?.id });
        } catch (e) {
            console.error("[orders] email:new_order_failed", e.message);
        }
    });

    orderEvents.on("order:lifecycle_changed", async ({ before, after, meta }) => {
        const id = after?.id;
        const prev = before?.orderLifecycle;
        const next = after?.orderLifecycle;
        log("order:lifecycle_changed", { id, prev, next, meta });

        try {
            if (next === "delivered" && prev !== "delivered") {
                const delivery = after.estimatedDelivery || meta?.estimatedDelivery;
                const shouldNotify = meta?.notifyClientAccept || !!delivery;
                if (shouldNotify) {
                    await sendOrderAcceptedToClient({ ...after, status: "completada", estimatedDelivery: delivery });
                    log("email:order_accepted_sent", { id });
                } else {
                    log("email:order_accepted_skipped", { id, reason: "no_delivery_hint" });
                }
            }
            if (next === "cancelled" && prev !== "cancelled" && meta?.source === "email_reject") {
                await sendOrderRejectedToClient(after);
                log("email:order_rejected_sent", { id });
            }
        } catch (e) {
            console.error("[orders] email:lifecycle_failed", e.message);
        }
    });
}

registerOrderListeners();
