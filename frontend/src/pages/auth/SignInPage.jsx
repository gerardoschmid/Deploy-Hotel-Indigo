import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <SignIn path="/login" routing="path" signUpUrl="/register" />
        </div>
    );
}
