import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen p-6 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 700px at 20% 20%, rgba(255,138,0,0.12), transparent 50%), linear-gradient(135deg, rgb(61,58,201), rgb(61,58,201))",
      }}
    >
      {/* decorative blobs */}
      <div className="absolute -left-20 -bottom-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-orange-400/20 blur-2xl" />

      <div className="h-full min-h-[calc(100vh-48px)] flex flex-col justify-between">
        <div className="pt-10">
          <div className="text-white/90 text-3xl font-semibold tracking-tight">
            Finance App
          </div>
          <p className="mt-3 text-white/70 text-sm max-w-[260px]">
            Carrying out financial transactions with the best security.
          </p>
        </div>

        {/* plant / coins placeholder card */}
        <div className="rounded-[28px] bg-white/10 border border-white/10 p-5 backdrop-blur-sm">
          <div className="text-white/90 text-sm">Tip</div>
          <div className="text-white/70 text-xs mt-1">
            Track income, expense, wallets & liabilities.
          </div>
        </div>

        <Link
          href="/home"
          className="inline-flex items-center justify-center h-12 rounded-[18px] font-medium text-white shadow-lg"
          style={{ backgroundColor: "rgb(var(--accent))" }}
        >
          Start →
        </Link>
      </div>
    </div>
  );
}
