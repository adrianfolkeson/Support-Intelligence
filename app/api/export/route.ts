import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = req.nextUrl.searchParams.get("orgId");
    const format = req.nextUrl.searchParams.get("format") || "csv"; // csv, pdf, xlsx

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    // TODO: Fetch actual data from database
    const tickets = [
      {
        id: "T1001",
        customer: "Acme Corp",
        subject: "Payment failing",
        churnRisk: 9,
        sentiment: "negative",
        createdAt: "2025-03-27",
      },
      {
        id: "T1002",
        customer: "TechStart Inc",
        subject: "Dashboard not updating",
        churnRisk: 8,
        sentiment: "negative",
        createdAt: "2025-03-27",
      },
    ];

    if (format === "csv") {
      // CSV export
      const headers = ["ID", "Customer", "Subject", "Churn Risk", "Sentiment", "Created At"];
      const rows = tickets.map(t => [
        t.id,
        t.customer,
        t.subject,
        t.churnRisk.toString(),
        t.sentiment,
        t.createdAt,
      ]);

      const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="tickets-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    if (format === "xlsx") {
      // Excel export (simplified - in production use xlsx library)
      const headers = "ID,Customer,Subject,Churn Risk,Sentiment,Created At\n";
      const rows = tickets.map(t =>
        `${t.id},${t.customer},${t.subject},${t.churnRisk},${t.sentiment},${t.createdAt}`
      ).join("\n");

      return new NextResponse(headers + rows, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="tickets-${new Date().toISOString().split("T")[0]}.xlsx"`,
        },
      });
    }

    if (format === "pdf") {
      // PDF export (simplified - in production use PDF generation library)
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1e40af; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Support Tickets Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Total Tickets: ${tickets.length}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Churn Risk</th>
                <th>Sentiment</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              ${tickets.map(t => `
                <tr>
                  <td>${t.id}</td>
                  <td>${t.customer}</td>
                  <td>${t.subject}</td>
                  <td>${t.churnRisk}</td>
                  <td>${t.sentiment}</td>
                  <td>${t.createdAt}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="tickets-${new Date().toISOString().split("T")[0]}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
