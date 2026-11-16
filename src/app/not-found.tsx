import Link from "next/link";
import { Logo } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="grid flex-1 place-items-center px-4 text-center">
      <div>
        <Logo />
        <h1 className="mt-6 text-2xl font-semibold">No encontramos esta página</h1>
        <Link href="/" className="btn btn-primary mt-6">Ir al inicio</Link>
      </div>
    </main>
  );
}
