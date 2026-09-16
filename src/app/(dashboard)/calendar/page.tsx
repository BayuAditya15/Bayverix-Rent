import { getCurrentBusinessOrRedirect } from "@/lib/auth/getCurrentBusiness";
import { createClient } from "@/lib/supabase/server";
import { CalendarDays, Plus, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const { businessId } = await getCurrentBusinessOrRedirect();
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_number,
      start_at,
      end_at,
      status,
      rental_total,
      customers (
        name
      ),
      booking_items (
        item_name_snapshot,
        quantity
      )
    `)
    .eq("business_id", businessId)
    .in("status", ["CONFIRMED", "ONGOING", "OVERDUE"])
    .order("start_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">Kalender Jadwal Sewa</h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
            Monitoring jadwal pengambilan dan pengembalian unit sewa aktif
          </p>
        </div>

        <Link
          href="/bookings/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Booking Baru</span>
        </Link>
      </div>

      {(!bookings || bookings.length === 0) ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-[#eff4ff] text-[#0051d5]">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#0b1c30]">Belum Ada Jadwal Aktif</h3>
          <p className="text-xs text-[#64748b] max-w-sm mx-auto">
            Semua booking berstatus Confirmed atau Ongoing akan otomatis muncul dalam linimasa kalender sewa.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
            Linimasa Sewa Mendatang &amp; Berjalan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((b) => {
              const customer = Array.isArray(b.customers) ? b.customers[0] : b.customers;
              const startStr = new Date(b.start_at).toLocaleDateString("id-ID", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });
              const endStr = new Date(b.end_at).toLocaleDateString("id-ID", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 flex flex-col justify-between hover:border-[#0051d5]/50 transition"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-[#0051d5]">{b.booking_number}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#0051d5]">
                        {b.status}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-[#0b1c30]">{customer?.name || "Pelanggan"}</p>

                    <div className="text-[11px] text-[#64748b] space-y-1 bg-[#f8f9ff] p-2.5 rounded-xl border border-slate-100">
                      <p>
                        <strong>Ambil:</strong> {startStr}
                      </p>
                      <p>
                        <strong>Kembali:</strong> {endStr}
                      </p>
                    </div>

                    <div className="text-[11px] text-[#0b1c30]">
                      <p className="font-medium text-[#64748b] mb-1">Unit:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                        {b.booking_items?.map((item: any, idx: number) => (
                          <li key={idx} className="truncate">
                            {item.quantity}x {item.item_name_snapshot}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="font-bold text-[#0b1c30]">
                      Rp {Number(b.rental_total).toLocaleString("id-ID")}
                    </span>
                    <Link
                      href={`/bookings/${b.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0051d5] hover:underline"
                    >
                      Buka Detail <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
