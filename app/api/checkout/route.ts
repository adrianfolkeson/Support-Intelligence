import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { checkoutSchema, formatZodError } from "@/lib/validations";
import { handleAPIError, logRequest, logSecurityEvent, requireEnv } from "@/lib/error-handler";

const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
  apiVersion: "2023-10-16",
});

const PRICE_ID = requireEnv('STRIPE_PRICE_ID');

export async function POST(request: Request) {
  const start = Date.now();

  try {
    const { userId } = await auth();

    if (!userId) {
      logSecurityEvent({
        event: 'unauthorized_access',
        details: { reason: 'No user ID found', path: '/api/checkout' }
      });

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limiting
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const { success, resetTime } = await rateLimit.auth.limit(userId);

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
