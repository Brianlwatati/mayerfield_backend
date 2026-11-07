// routes/webhook.js or directly in server.js
import express from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookRouter = express.Router();

webhookRouter.post(
  "/stripe",
  express.raw({ type: "application/json" }), // Crucial: Raw buffer for signature verification
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error(`Webhook Signature Verification Failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Extract client_reference_id or metadata where order ID is stored
      const orderId = session.client_reference_id || session.metadata?.order_id;

      if (orderId) {
        // Update database status to 'paid'
        await db.query("UPDATE orders SET status = 'paid' WHERE id = $1", [
          orderId,
        ]);
        console.log(`Order ${orderId} updated to PAID`);
      }
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      // Extract order ID from payment intent metadata
      const orderId = paymentIntent.metadata?.order_id;

      if (orderId) {
        await db.query("UPDATE orders SET status = 'paid' WHERE id = $1", [
          orderId,
        ]);
        console.log(`Order ${orderId} updated to PAID via PaymentIntent`);
      }
    }

    res.json({ received: true });
  },
);

export default webhookRouter;
