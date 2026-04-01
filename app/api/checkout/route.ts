import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { checkoutSchema, formatZodError } from "@/lib/validations";
import { handleAPIError, logRequest, logSecurityEvent } from "@/lib/error-handler";
import { getAuthenticatedUser } from "@/lib/supabase/auth-api";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const start = Date.now();

  try {
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

    // Create organization directly (skip payment for now)
    const supabase = await createClient();

    // Generate a unique slug from organization name
    const baseSlug = organizationName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists and make it unique
    while (true) {
      const { data: existingOrg } = await supabase
        .from('Organization')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existingOrg) {
        break; // Slug is unique
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create the organization
    const { data: organization, error: orgError } = await supabase
      .from('Organization')
      .insert({
        name: organizationName,
        slug: slug,
        supabaseUserId: userId,
        plan: 'trial',
        status: 'active',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      })
      .select('id')
      .single();

    if (orgError || !organization) {
      console.error('Failed to create organization:', orgError);
      throw new Error('Failed to create organization. Please try again.');
    }

    // Add user as organization owner
    const { error: memberError } = await supabase
      .from('OrganizationUser')
      .insert({
        organizationId: organization.id,
        userId: userId,
        role: 'owner',
      });

    if (memberError) {
      console.error('Failed to add user to organization:', memberError);
      // Don't throw - org was created successfully
    }

    logRequest({
      method: 'POST',
      path: '/api/checkout',
      status: 200,
      duration: Date.now() - start,
      userId,
      ip,
    });

    // Return success with organization info (skip Stripe checkout)
    return NextResponse.json({
      success: true,
      organizationId: organization.id,
      slug: slug,
      redirectUrl: '/welcome'
    });

  } catch (error: any) {
    return handleAPIError(error, {
      method: 'POST',
      path: '/api/checkout',
      duration: Date.now() - start,
    });
  }
}
