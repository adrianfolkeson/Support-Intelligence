import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { checkoutSchema, formatZodError } from "@/lib/validations";
import { handleAPIError, logRequest, logSecurityEvent, requireEnv } from "@/lib/error-handler";
import { getAuthenticatedUser } from "@/lib/supabase/auth-api";

const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'));

const PRICE_ID = requireEnv('STRIPE_PRICE_ID');

export async function POST(request: Request) {
  const start = Date.now();

  try {
    // Verify Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
      console.error('Stripe configuration missing:', {
        hasKey: !!process.env.STRIPE_SECRET_KEY,
        hasPriceId: !!process.env.STRIPE_PRICE_ID,
      });
      return NextResponse.json(
        {
          error: 'Payment system is not configured. Please contact support.',
          details: 'Stripe is not properly configured'
        },
        { status: 500 }
      );
    }

    const { userId, response } = await getAuthenticatedUser();

    if (response) {
      logSecurityEvent({
        event: 'unauthorized_access',
        details: { reason: 'No user ID found', path: '/api/checkout' }
      });

      return response;
    }

    // Rate limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const { success, reset: resetTime } = await rateLimit({
      identifier: `checkout:${userId}`,
      limit: 3, // 3 checkout attempts per hour
      window: 3600
    });

    if (!success) {
      logSecurityEvent({
        event: 'rate_limit_exceeded',
        userId,
        ip,
        details: { endpoint: '/api/checkout', resetTime }
      });

      return NextResponse.json(
        {
          error: 'Too many checkout attempts. Please try again later.',
          retryAfter: resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetTime
              ? Math.ceil((resetTime - Date.now()) / 1000).toString()
              : '60',
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = checkoutSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        formatZodError(validationResult.error),
        { status: 400 }
      );
    }

    const { organizationName } = validationResult.data;

    const customer = await stripe.customers.create({
      metadata: {
        organization_id: userId,
        organization_name: organizationName,
        user_id: userId,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: {
        organization_id: userId,
      },
      subscription_data: {
        metadata: {
          organization_id: userId,
        },
        trial_period_days: 30,
      },
    });

    logRequest({
      method: 'POST',
      path: '/api/checkout',
      status: 200,
      duration: Date.now() - start,
      userId,
      ip,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return handleAPIError(error, {
      method: 'POST',
      path: '/api/checkout',
      duration: Date.now() - start,
    });
  }
}
