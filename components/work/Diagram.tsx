import type { Diagram as DiagramData } from "@/lib/work";

/* Static architecture diagram in the homepage node style. Rendered as SVG at
   build time (no client JS). Wide screens get the SVG; narrow screens get the
   same flow as a numbered vertical list so labels stay readable. */

const VB_W = 1120;
const ROW_H = 120;
const PAD_Y = 30;
const NODE_H_LINE = 16;
const CHAR_W = 8.1; // JetBrains Mono at 12.5px + 0.04em tracking

function wrap(text: string, maxChars: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= maxChars) cur += " " + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

export default function Diagram({ data, id, compact = false }: { data: DiagramData; id: string; compact?: boolean }) {
  /* Collapse unused columns/rows so space goes to the nodes that exist. */
  const colIndex = new Map(Array.from(new Set(data.nodes.map((n) => n.col))).sort((a, b) => a - b).map((c, i) => [c, i]));
  const rowIndex = new Map(Array.from(new Set(data.nodes.map((n) => n.row))).sort((a, b) => a - b).map((r, i) => [r, i]));
  const cols = colIndex.size;
  const rows = rowIndex.size;
  const colW = VB_W / cols;
  const gap = Math.max(44, Math.min(90, colW * 0.26));
  const nodeW = Math.min(260, colW - gap);
  const showBadge = nodeW > 190;
  const charsPerLine = Math.max(8, Math.floor((nodeW - 50 - (showBadge ? 40 : 0)) / CHAR_W));

  const layout = Object.fromEntries(
    data.nodes.map((n) => {
      const c = colIndex.get(n.col) ?? 0;
      const r = rowIndex.get(n.row) ?? 0;
      const lines = wrap(n.label.toUpperCase(), charsPerLine);
      const h = 26 + lines.length * NODE_H_LINE;
      const cx = colW * c + colW / 2;
      const cy = PAD_Y + r * ROW_H + ROW_H / 2;
      return [n.id, { ...n, c, r, lines, h, cx, cy, x: cx - nodeW / 2, y: cy - h / 2 }];
    })
  );
  const height = PAD_Y * 2 + rows * ROW_H;

  /* Edge geometry plus the room available for its label (0 = no label). */
  const edgePath = (from: string, to: string) => {
    const a = layout[from];
    const b = layout[to];
    if (b.c > a.c) {
      const x1 = a.x + nodeW, y1 = a.cy, x2 = b.x - 6, y2 = b.cy;
      const mx = (x1 + x2) / 2;
      // Same row: the label must fit in the horizontal gap. Different rows:
      // it sits between the rows, clear of the node boxes.
      const room = a.r === b.r ? x2 - x1 - 10 : colW * 1.2;
      return { d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`, lx: mx, ly: a.r === b.r ? y1 - 12 : (y1 + y2) / 2, room };
    }
    if (b.c === a.c) {
      const down = b.cy > a.cy;
      const y1 = down ? a.y + a.h : a.y, y2 = down ? b.y - 6 : b.y + b.h + 6;
      return { d: `M ${a.cx} ${y1} L ${b.cx} ${y2}`, lx: a.cx, ly: (y1 + y2) / 2, room: Math.abs(y2 - y1) > 30 ? nodeW : 0 };
    }
    // Backwards edge: loop under the nodes.
    const x1 = a.cx, y1 = a.y + a.h, x2 = b.cx, y2 = b.y + b.h + 6;
    const dip = Math.max(y1, y2) + 34;
    return { d: `M ${x1} ${y1} C ${x1} ${dip}, ${x2} ${dip}, ${x2} ${y2}`, lx: (x1 + x2) / 2, ly: dip - 8, room: Math.abs(x2 - x1) };
  };
  const labelW = (t: string) => t.length * 6.9 + 12;

  const ordered = [...data.nodes].sort((a, b) => a.col - b.col || a.row - b.row);
  const label = `${data.title}. ${data.edges
    .map((e) => `${layout[e.from].label} to ${layout[e.to].label}${e.label ? ` (${e.label})` : ""}`)
    .join("; ")}.`;
  const markerId = `arr-${id}`;

  return (
    <figure className={"diagram" + (compact ? " is-compact" : "")}>
      <figcaption className="diagram-cap">
        <span className="dot" aria-hidden="true"></span>
        {data.title}
      </figcaption>
      {compact ? null : (
      <div className="diagram-canvas">
        <svg viewBox={`0 0 ${VB_W} ${height}`} role="img" aria-label={label} className="diagram-svg">
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#a3ff12" />
            </marker>
            <pattern id={`grid-${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1d2128" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={VB_W} height={height} fill={`url(#grid-${id})`} opacity="0.5" />
          {data.edges.map((e, i) => {
            const p = edgePath(e.from, e.to);
            return (
              <g key={i}>
                <path d={p.d} className="dg-edge" markerEnd={`url(#${markerId})`} />
                {e.label && labelW(e.label) <= p.room ? (
                  <g>
                    <rect
                      x={p.lx - labelW(e.label) / 2}
                      y={p.ly - 10}
                      width={labelW(e.label)}
                      height={18}
                      className="dg-edge-bg"
                    />
                    <text x={p.lx} y={p.ly + 3} textAnchor="middle" className="dg-edge-label">
                      {e.label}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
          {data.nodes.map((n) => {
            const l = layout[n.id];
            return (
              <g key={n.id} className={"dg-node" + (n.accent ? " is-accent" : "")}>
                <rect x={l.x} y={l.y} width={nodeW} height={l.h} className="dg-box" />
                <rect x={l.x + 12} y={l.cy - 10} width={20} height={20} rx={4} className="dg-icon" />
                <text x={l.x + 22} y={l.cy + 4} textAnchor="middle" className="dg-icon-txt">
                  {(n.badge || n.label)[0]}
                </text>
                <text x={l.x + 42} y={l.cy - ((l.lines.length - 1) * NODE_H_LINE) / 2 + 4} className="dg-label">
                  {l.lines.map((line, i) => (
                    <tspan key={i} x={l.x + 42} dy={i === 0 ? 0 : NODE_H_LINE}>
                      {line}
                    </tspan>
                  ))}
                </text>
                {showBadge && n.badge ? (
                  <text x={l.x + nodeW - 10} y={l.cy + 4} textAnchor="end" className="dg-badge">
                    {n.badge}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
      )}
      <ol className="diagram-list">
        {ordered.map((n, i) => {
          const out = data.edges.filter((e) => e.from === n.id);
          return (
            <li key={n.id} className={n.accent ? "is-accent" : ""}>
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              <span className="l">{n.label}</span>
              {out.length ? (
                <span className="to">
                  → {out.map((e) => layout[e.to].label + (e.label ? ` · ${e.label}` : "")).join(", ")}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
