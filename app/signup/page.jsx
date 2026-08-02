import { Suspense } from "react";
import { RegistrationProvider } from "../context/registrationContext";
import SignUpForm from "./signUpForm";

export default function SignUpPage() {
  return (

    <Suspense>
      <SignUpForm/>
    </Suspense>

  )
}