'use server'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const createStripePaymentIntent = async (amount: number) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      description: "Payment for event ticket",
    });
    return {
      success: true,
      paymentIntent: paymentIntent.client_secret
    }
  } catch (error: any) {
    return {
      success: false,
      message: "Error creating payment intent: " + (error as Error).message
    }
  }
}