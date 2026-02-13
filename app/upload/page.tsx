"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/file-upload";
import { Spinner } from "@/components/ui/spinner";
import { fetchAPI } from "@/lib/api";
import { ToastProvider, useToast } from "@/components/ui/toast";

function UploadContent() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { showToast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ count: number } | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    // Get orgId from cookie
    const getOrgId = () => {
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "orgId") return value;
      }
      return null;
    };

    const orgIdFromCookie = getOrgId();
    if (!orgIdFromCookie) {
      showToast("Please complete your account setup first", "error");
      router.push("/welcome");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvData = e.target?.result as string;

        try {
          const token = await getToken();
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              organizationId: orgIdFromCookie,
              csvData,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Upload failed");
          }

          const data = await response.json();
          setResult({ count: data.importedCount || data.count || 0 });
          showToast(`Successfully imported ${data.importedCount || data.count || 0} tickets`, "success");
        } catch (error: any) {
          console.error("Upload error:", error);
          showToast(error.message || "Failed to upload file", "error");
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        showToast("Failed to read file", "error");
        setUploading(false);
      };

      reader.readAsText(file);
    } catch (error: any) {
      console.error("Upload error:", error);
      showToast(error.message || "Failed to upload file", "error");
      setUploading(false);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Upload Support Tickets</h1>
          <p className="mt-2 text-gray-600">
            Import your support tickets from a CSV file
          </p>
        </div>

        {/* CSV Format Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">CSV Format Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Your CSV file should include the following columns:
            </p>
            <div className="overflow-x-auto rounded-lg bg-gray-900 p-4">
              <code className="text-sm text-gray-100">
                customer_id,subject,message
              </code>
            </div>
            <div className="mt-4 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Example:</strong>
              </p>
              <pre className="mt-2 text-xs text-blue-700">
{`C001,Login issue,I can't log into my account
C002,Billing question,I was charged twice this month
C003,Feature request,Can you add dark mode?`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload File
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept=".csv"
                />

                {file && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-600">
                      Selected file: <span className="font-medium">{file.name}</span>
                    </p>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="mt-4"
                    >
                      {uploading ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  Upload Complete!
                </h3>
                <p className="mt-2 text-gray-600">
                  Successfully imported {result.count} ticket{result.count !== 1 ? "s" : ""}.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <Button onClick={() => router.push("/dashboard")}>
                    Go to Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setResult(null);
                    }}
                  >
                    Upload More
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <ToastProvider>
      <UploadContent />
    </ToastProvider>
  );
}
