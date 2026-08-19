// app/otp/page.tsx
import { Suspense } from "react";
import { RegistrationProvider } from "../context/registrationContext";
import OtpForm from "./otpForm";
import { Loader2 } from "lucide-react";

export default function OtpPage() {
  return (
    <RegistrationProvider>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen bg-white font-mono text-xs uppercase tracking-wider text-black">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-3 w-3 animate-spin text-black" />
              <span>LOADING...</span>
            </div>
          </div>
        }
      >
        <OtpForm />
      </Suspense>
    </RegistrationProvider>
  );
}