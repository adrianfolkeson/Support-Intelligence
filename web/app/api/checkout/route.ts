import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { organizationName } = body;

    if (!organizationName) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://support-intelligence-backend.vercel.app';

    // Create organization first
    const orgResponse = await fetch(`${backendUrl}/api/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: organizationName, userId }),
    });

    if (!orgResponse.ok) {
      const error = await orgResponse.json();
      throw new Error(error.error || 'Failed to create organization');
    }

    const orgData = await orgResponse.json();
    const organizationId = orgData.organization.id;

    // Create checkout session via backend
    const checkoutResponse = await fetch(`${backendUrl}/api/organizations/${organizationId}/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Frontend-Url': process.env.NEXT_PUBLIC_URL || 'https://supportintelligence.vercel.app',
      },
    });

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const checkoutData = await checkoutResponse.json();

    return NextResponse.json({
      url: checkoutData.checkoutUrl,
      organizationId,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      {
        error: 'Failed to start checkout',
        details: error.message
      },
      { status: 500 }
    );
  }
}
