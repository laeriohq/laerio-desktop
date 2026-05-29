import { type Dispatch, type SetStateAction } from "react";

export type LaerioRoute = "brands" | "research" | "health";

export default function LaerioSection(props: {
  current: LaerioRoute | null;
  onPick: Dispatch<SetStateAction<LaerioRoute | null>>;
}): React.JSX.Element {
  const items: LaerioRoute[] = ["brands", "research", "health"];
  return (
    <div className="border-t mt-2 pt-2">
      <div className="text-xs opacity-60 px-2 mb-1">L'AERIO HQ</div>
      {items.map((it) => (
        <div
          key={it}
          onClick={() => props.onPick(it)}
          className={`px-2 py-1 cursor-pointer text-sm rounded ${
            props.current === it
              ? "bg-neutral-800 text-white"
              : "hover:bg-neutral-900/50"
          }`}
        >
          {it}
        </div>
      ))}
    </div>
  );
}
