import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Debug: Log env vars (without exposing the key)
    console.log('Stripe_Secret_Key exists:', !!process.env.Stripe_Secret_Key);
    console.log('Stripe_Price_ID:', process.env.Stripe_Price_ID);
    console.log('NextPublic_URL:', process.env.NextPublic_URL);

    // Initialize Stripe inside the function to avoid build-time errors
    const stripeSecretKey = process.env.Stripe_Secret_Key;
    const priceId = process.env.Stripe_Price_ID;

    if (!stripeSecretKey || !priceId) {
      console.error('Missing configuration:', { stripeSecretKey: !!stripeSecretKey, priceId });
      return NextResponse.json(
        { error: 'Server configuration error: Missing Stripe credentials' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const baseUrl = process.env.NextPublic_URL || 'https://supportintelligence.vercel.app';

    console.log('Creating Stripe checkout session with:', { priceId, baseUrl });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/welcome?success=true`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
    });

    console.log('Stripe session created:', session.id);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error.message
      },
      { status: 500 }
    );
  }
}
