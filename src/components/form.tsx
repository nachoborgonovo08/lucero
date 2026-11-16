"use client";

import { createContext, startTransition, use, useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

const PendingContext = createContext(false);

type State = { error?: string; ok?: string } | undefined;

export function ActionForm({
  action,
  children,
  className,
  resetOnOk,
}: {
  action: (prev: State, form: FormData) => Promise<State>;
  children: React.ReactNode;
  className?: string;
  resetOnOk?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (resetOnOk && state?.ok) ref.current?.reset();
  }, [state, resetOnOk]);
  return (
    <form
      ref={ref}
      className={className}
      // Se envía a mano para que React no vacíe los campos cuando hay un error.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      <PendingContext value={pending}>{children}</PendingContext>
      <Message state={state} />
    </form>
  );
}

export function Message({ state }: { state: State }) {
  if (!state?.error && !state?.ok) return null;
  return (
    <p
      role={state.error ? "alert" : "status"}
      className={`mt-3 rounded-lg px-3 py-2 text-sm ${state.error ? "bg-red-50 text-bad" : "bg-emerald-50 text-ok"}`}
    >
      {state.error ?? state.ok}
    </p>
  );
}

export function Submit({ children, className = "btn btn-primary" }: { children: React.ReactNode; className?: string }) {
  const status = useFormStatus();
  const pending = use(PendingContext) || status.pending;
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "Un momento…" : children}
    </button>
  );
}

export function CopyButton({ text, label = "Copiar", className = "btn btn-ghost btn-sm" }: { text: string; label?: string; className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={async (e) => {
        const el = e.currentTarget;
        await navigator.clipboard.writeText(text);
        const prev = el.textContent;
        el.textContent = "¡Copiado!";
        setTimeout(() => (el.textContent = prev), 1500);
      }}
    >
      {label}
    </button>
  );
}

export function PrintButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="btn btn-primary" onClick={() => window.print()}>
      {children}
    </button>
  );
}
