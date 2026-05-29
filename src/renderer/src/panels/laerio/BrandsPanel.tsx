import { useEffect, useState } from "react";
import { laerio, BrandRow } from "./api";

export default function BrandsPanel(): React.JSX.Element {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<BrandRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run(): Promise<void> {
    setBusy(true);
    setErr(null);
    try {
      const res = await laerio().brandsSearch({ q, limit: 50 });
      setRows(res.rows);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void run();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-2xl font-semibold">L'AERIO Brands</h2>
      <div className="flex gap-2">
        <input
          className="flex-1 px-2 py-1 rounded border bg-transparent"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search name or slug…"
          onKeyDown={(e) => e.key === "Enter" && void run()}
        />
        <button
          className="px-3 py-1 rounded border"
          onClick={() => void run()}
          disabled={busy}
        >
          {busy ? "…" : "Search"}
        </button>
      </div>
      {err && <div className="text-red-500 text-sm">{err}</div>}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left opacity-70">
            <th>id</th>
            <th>name</th>
            <th>tier</th>
            <th>fit</th>
            <th>niche</th>
            <th>country</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="font-mono">{r.id}</td>
              <td>{r.name}</td>
              <td className="text-center">{r.tier ?? ""}</td>
              <td className="text-right">{r.fit_score ?? ""}</td>
              <td>{r.niche_group ?? ""}</td>
              <td>{r.country ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
