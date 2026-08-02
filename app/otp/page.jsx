import { RegistrationProvider } from "../context/registrationContext";
import OtpForm from "./otpForm";

export default function OtpPage() {
  return (
    <RegistrationProvider>
        <OtpForm />
    </RegistrationProvider>
  );
}

