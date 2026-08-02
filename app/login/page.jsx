import { Suspense } from "react";
import LoginForm from "./loginForm";


export default function SignInPage() {
  return (
    <Suspense >
      <LoginForm/>
    </Suspense>
  )
}