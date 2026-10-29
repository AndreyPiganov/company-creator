import clsx from "clsx";

export function StatusBadge({ status }: { status: "draft" | "approved" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
      )}
    >
      {status === "approved" ? "Утверждена" : "Черновик"}
    </span>
  );
}
