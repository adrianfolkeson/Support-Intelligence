import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Initialize Stripe inside the function to avoid build-time errors
    const stripeSecretKey = process.env.Stripe_Secret_Key;
    const priceId = process.env.Stripe_Price_ID;

    if (!stripeSecretKey || !priceId) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const baseUrl = process.env.NextPublic_URL || 'https://support-intelligence.vercel.app';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
