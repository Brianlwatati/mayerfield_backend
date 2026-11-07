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
      const eventObject = event.data.object;
      let orderId = null;
      let isPaid = false;
      let stripeSessionId = null;

      // Handle Checkout Session completion events
      if (
        event.type === "checkout.session.completed" ||
        event.type === "checkout.session.async_payment_succeeded"
      ) {
        if (eventObject.payment_status === "paid") {
          isPaid = true;
          orderId =
            eventObject.client_reference_id || eventObject.metadata?.order_id;
          stripeSessionId = eventObject.id;
        }
      }
      // Handle Payment Intent success fallback event
      else if (event.type === "payment_intent.succeeded") {
        if (eventObject.status === "succeeded") {
          isPaid = true;
          orderId = eventObject.metadata?.order_id;
          stripeSessionId = eventObject.id;
        }
      }

      if (isPaid) {
        if (!orderId) {
          console.error(
            `Stripe event ${event.id} is missing its order reference in metadata.`,
          );
          return res.status(400).send("Stripe event has no order reference");
        }

        const order = await orderRepository.updateOrderStatus(
          orderId,
          "paid",
          stripeSessionId,
        );

        if (!order) {
          console.error(`No order found in database for ID: ${orderId}`);
          return res.status(500).send("Order was not found or updated");
        }

        console.log(
          `Successfully updated order ${orderId} to paid via webhook (${event.type}).`,
        );
      }
    } catch (error) {
      console.error("Stripe webhook processing failed:", error);
      return res.status(500).send("Webhook processing failed");
    }

    return res.json({ received: true });
  },
);

export default webhookRouter;
