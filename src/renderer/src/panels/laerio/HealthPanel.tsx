import { useEffect, useState } from "react";
import { laerio } from "./api";

export default function HealthPanel(): React.JSX.Element {
  const [data, setData] = useState<Awaited<
    ReturnType<ReturnType<typeof laerio>["health"]>
  > | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    laerio()
      .health()
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, []);

  if (err) {
    return (
      <div className="p-4 text-red-500">
        Error: {err}
        <p className="text-sm mt-2 opacity-70">
          Is the sidecar running on 127.0.0.1:5180?
        </p>
      </div>
    );
  }
  if (!data) return <div className="p-4">loading…</div>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-semibold">L'AERIO Health</h2>
      <p>
        DB exists: <code>{String(data.db_exists)}</code>
      </p>
      {data.db_path && (
        <p>
          Path: <code>{data.db_path}</code>
        </p>
      )}
      <h3 className="text-lg font-semibold">Row counts</h3>
      <table className="text-sm">
        <tbody>
          {Object.entries(data.counts).map(([t, n]) => (
            <tr key={t}>
              <td className="pr-4 font-mono">{t}</td>
              <td className="text-right tabular-nums">{n.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
