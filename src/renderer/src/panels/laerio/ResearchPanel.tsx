import { useState } from "react";
import { laerio, FindHit } from "./api";

const DEFAULT_INTENT =
  "clean beauty brand offering creator program for tier-2 indie launch";

export default function ResearchPanel(): React.JSX.Element {
  const [intent, setIntent] = useState(DEFAULT_INTENT);
  const [hits, setHits] = useState<FindHit[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [angles, setAngles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  async function find(): Promise<void> {
    setBusy(true);
    setErr(null);
    setAngles([]);
    try {
      const res = await laerio().researchFind(intent, 10);
      setHits(res.hits);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function pitch(brandId: string): Promise<void> {
    setSelected(brandId);
    setAngles([]);
    setBusy(true);
    setErr(null);
    try {
      const res = await laerio().researchPitch(brandId, 5);
      setAngles(res.angles);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Research → find</h2>
        <textarea
          className="w-full px-2 py-1 rounded border bg-transparent"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          rows={3}
        />
        <button
          className="px-3 py-1 rounded border"
          onClick={() => void find()}
          disabled={busy}
        >
          {busy ? "…" : "Find"}
        </button>
        {err && <div className="text-red-500 text-sm">{err}</div>}
        <ul className="space-y-1">
          {hits.map((h) => (
            <li key={h.brand_id} className="text-sm">
              <button
                className="mr-2 px-2 py-0.5 rounded border text-xs"
                onClick={() => void pitch(h.brand_id)}
                disabled={busy}
              >
                pitch
              </button>
              <b>{h.name}</b>{" "}
              <span className="opacity-60">({h.brand_id})</span> tier {h.tier} ·{" "}
              {h.niche_group} · d={h.distance.toFixed(3)}
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">
          Pitch angles{" "}
          {selected && <span className="text-sm opacity-60">for {selected}</span>}
        </h2>
        {angles.length === 0 ? (
          <p className="opacity-60 text-sm">
            Click "pitch" on any hit to draft 5 angles via Qwen.
          </p>
        ) : (
          <ol className="space-y-2 list-decimal pl-6">
            {angles.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
