"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !organizationName.trim()) {
      setError('Please provide both a file and organization name');
      return;
    }

    setUploading(true);
    setError('');
    setProgress('Uploading CSV...');

    try {
      // Read file content
      const text = await file.text();

      setProgress('Parsing tickets...');

      // Send to backend
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationName,
          csvData: text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      setProgress(`Imported ${result.ticketCount} tickets. Starting AI analysis...`);
      setUploading(false);
      setAnalyzing(true);

      // Start analysis
      const analyzeResponse = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: result.organizationId,
        }),
      });

      if (!analyzeResponse.ok) {
        throw new Error('Analysis failed');
      }

      const analyzeResult = await analyzeResponse.json();

      setProgress(`✓ Complete! Analyzed ${analyzeResult.ticketsAnalyzed} tickets`);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard?org=${result.organizationId}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setUploading(false);
      setAnalyzing(false);
      setProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Support Intelligence
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">View Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Upload Support Tickets</CardTitle>
            <CardDescription>
              Import your support tickets from Zendesk, Intercom, or any CSV export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Name */}
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  id="orgName"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Acme Corp"
                  disabled={uploading || analyzing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 mb-2">
                  CSV File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="csvFile"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="csvFile"
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          disabled={uploading || analyzing}
                          className="sr-only"
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">CSV file with customer_id, subject, message</p>
                  </div>
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* CSV Format Help */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Format Required:</h4>
                <pre className="text-xs text-blue-800 bg-white p-2 rounded border border-blue-100 overflow-x-auto">
customer_id,subject,message{'\n'}
user123,Login issue,I can't log in to my account{'\n'}
user456,Feature request,Would love dark mode
                </pre>
              </div>

              {/* Progress/Error Messages */}
              {progress && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-sm text-green-800">{progress}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={uploading || analyzing || !file || !organizationName.trim()}
                className="w-full"
              >
                {uploading
                  ? 'Uploading...'
                  : analyzing
                  ? 'Analyzing with AI...'
                  : 'Upload and Analyze'}
              </Button>

              {analyzing && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">How to export tickets:</h3>

          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-1">Zendesk</h4>
              <p className="text-sm text-gray-600">
                Admin → Reporting → Export → Tickets → Select date range → Export as CSV
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-1">Intercom</h4>
              <p className="text-sm text-gray-600">
                Inbox → Conversations → Filter by date → Export → Download CSV
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-1">Freshdesk</h4>
              <p className="text-sm text-gray-600">
                Reports → Ticket Reports → Export → CSV format
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
