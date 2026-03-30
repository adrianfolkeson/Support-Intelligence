import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const uploadSchema = z.object({
  organizationId: z.string().optional(),
  csvData: z.string(),
});

// POST /api/upload - Upload CSV file with tickets
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate CSV
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    // Parse CSV (assuming format: customer_email,subject,description,priority,status)
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const emails = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= 2) {
        const ticket = {
          customerEmail: values[0]?.trim() || '',
          subject: values[1]?.trim() || '',
          description: values[2]?.trim() || '',
          priority: values[3]?.trim() || 'medium',
          status: values[4]?.trim() || 'open',
        };

        if (ticket.customerEmail) {
          emails.push(ticket.customerEmail);
        }
      }
    }

    return NextResponse.json({
      message: "CSV uploaded successfully",
      stats: {
        totalRows: lines.length - 1,
        validTickets: emails.length,
        emails,
      },
    });
  } catch (error: any) {
    console.error("Error uploading CSV:", error);
    return NextResponse.json(
      { error: "Failed to upload CSV" },
      { status: 500 }
    );
  }
}
