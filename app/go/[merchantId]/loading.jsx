import { RedirectLogos } from "./RedirectLogos";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-24 md:pt-32 bg-white px-4 text-center">
      <RedirectLogos brandLogo={null} brandName="" />
      <div className="h-10 w-10 border-4 border-gray-200 border-t-black rounded-full motion-safe:animate-spin mb-6" />
      <h1 className="text-lg font-semibold text-gray-800">Redirecting you...</h1>
      <p className="mt-2 text-sm text-gray-500">Setting up your link...</p>
    </div>
  );
}