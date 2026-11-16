import { Logo } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid flex-1 place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card">{children}</div>
      </div>
    </main>
  );
}
