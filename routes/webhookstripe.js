import express from "express";
import { stripe } from "../config/stripe.js";
import { OrderRepository } from "../repository/ordersrepository.js";

const webhookRouter = express.Router();
const orderRepository = new OrderRepository();

webhookRouter.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
      }

      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error(`Webhook Signature Verification Failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (
        event.type === "checkout.session.completed" ||
        event.type === "checkout.session.async_payment_succeeded" ||
        event.type === "payment_intent.succeeded"
      ) {
        const session = event.data.object;
        if (session.payment_status === "paid") {
          const orderId =
            session.client_reference_id || session.metadata?.order_id;

          if (!orderId) {
            console.error(
              `Stripe session ${session.id} is missing its order reference`,
            );
            return res
              .status(400)
              .send("Stripe session has no order reference");
          }

          const order = await orderRepository.updateOrderStatus(
            orderId,
            "paid",
            session.id,
          );
          if (!order) {
            console.error(
              `No order found for Stripe session ${session.id} (order ${orderId})`,
            );
            return res.status(500).send("Order was not updated");
          }
        }
      }
    } catch (error) {
      console.error("Stripe webhook processing failed:", error);
      return res.status(500).send("Webhook processing failed");
    }

    res.json({ received: true });
  },
);

export default webhookRouter;
