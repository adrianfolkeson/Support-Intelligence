import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <SignUp
        afterSignUpUrl="/pricing"
        signInUrl="/sign-in"
        redirectUrl="https://support-intelligence-39epmao9a-adrianfolkesons-projects.vercel.app"
      />
    </div>
  );
}
