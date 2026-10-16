import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface Series {
  key: string;
  label: string;
  color: string;
  values: number[];
}

interface Props {
  title: string;
  subtitle?: string;
  series: Series[];
  xLabels: string[];
  format: (v: number) => string;
  yMin?: number;
  yMax?: number;
  reference?: { value: number; label: string };
  height?: number;
}

const SURFACE = '#21242b';
const PAD = { top: 16, right: 64, bottom: 28, left: 44 };

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

function useWidth<T extends HTMLElement>(): [React.RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(600);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/**
 * Multi-series line chart: one y-axis, 2px lines, ringed end markers, legend +
 * selective direct end labels, crosshair tooltip, and a table view.
 */
export function LineChart({ title, subtitle, series, xLabels, format, yMin = 0, yMax, reference, height = 220 }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const n = xLabels.length;

  const { maxY, x, y, ticks } = useMemo(() => {
    const dataMax = Math.max(...series.flatMap((s) => s.values), reference?.value ?? 0, 0);
    const maxY = yMax ?? niceMax(dataMax * 1.1);
    const innerW = Math.max(10, width - PAD.left - PAD.right);
    const innerH = height - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = (v: number) => PAD.top + innerH - ((v - yMin) / (maxY - yMin)) * innerH;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => yMin + t * (maxY - yMin));
    return { maxY, x, y, ticks };
  }, [series, reference, yMax, yMin, width, height, n]);

  // Direct end labels only when they don't collide; otherwise legend + tooltip carry identity.
  const endYs = series.map((s) => y(s.values[s.values.length - 1] ?? 0));
  const labelsCollide = endYs.some((a, i) => endYs.some((b, j) => i !== j && Math.abs(a - b) < 14));

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left + PAD.left;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(x(i) - px);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    setHover(best);
  };

  return (
    <figure className="glass p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <figcaption className="font-display text-base font-semibold text-white">{title}</figcaption>
          {subtitle && <p className="text-xs text-ink-400">{subtitle}</p>}
        </div>
        <button
          onClick={() => setShowTable((v) => !v)}
          className="rounded-lg border border-white/10 px-2 py-1 text-[11px] font-semibold text-ink-300 hover:text-white"
          aria-pressed={showTable}
        >
          {showTable ? 'Chart view' : 'Table view'}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-200" aria-label="Legend">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ background: s.color }} aria-hidden />
            {s.label}
          </span>
        ))}
        {reference && (
          <span className="inline-flex items-center gap-1.5 text-ink-400">
            <span className="h-px w-4 bg-ink-400" aria-hidden />
            {reference.label}
          </span>
        )}
      </div>

      <div ref={ref} className="relative mt-2 w-full">
      {showTable ? (
        <div className="mt-1 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-ink-400">
                <th className="py-1.5 pr-3 font-semibold">Quarter</th>
                {series.map((s) => (
                  <th key={s.key} className="py-1.5 pr-3 font-semibold">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums text-ink-100">
              {xLabels.map((label, i) => (
                <tr key={label} className="border-t border-white/6">
                  <td className="py-1.5 pr-3 text-ink-300">{label}</td>
                  {series.map((s) => (
                    <td key={s.key} className="py-1.5 pr-3">
                      {s.values[i] !== undefined ? format(s.values[i]) : 'n/a'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative w-full">
          <svg width={width} height={height} role="img" aria-label={`${title}. Use the table view for exact values.`}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="#3b3f49" strokeWidth={1} />
                <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-400 text-[10px] tabular-nums">
                  {format(t)}
                </text>
              </g>
            ))}
            {xLabels.map((label, i) => (
              <text key={label} x={x(i)} y={height - 8} textAnchor="middle" className="fill-ink-400 text-[10px]">
                {label}
              </text>
            ))}
            {reference && reference.value <= maxY && (
              <line x1={PAD.left} x2={width - PAD.right} y1={y(reference.value)} y2={y(reference.value)} stroke="#5c616c" strokeWidth={1} />
            )}
            {series.map((s) => (
              <path
                key={s.key}
                d={s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ')}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
            {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={height - PAD.bottom} stroke="#5c616c" strokeWidth={1} />}
            {series.map((s) => {
              const i = hover ?? s.values.length - 1;
              const v = s.values[i];
              if (v === undefined) return null;
              return <circle key={s.key} cx={x(i)} cy={y(v)} r={4.5} fill={s.color} stroke={SURFACE} strokeWidth={2} />;
            })}
            {!labelsCollide &&
              hover === null &&
              series.map((s) => {
                const last = s.values.length - 1;
                if (last < 0) return null;
                return (
                  <text key={s.key} x={x(last) + 10} y={y(s.values[last])} dy="0.32em" className="fill-ink-100 text-[11px] font-semibold">
                    {format(s.values[last])}
                  </text>
                );
              })}
            <rect
              x={PAD.left - 12}
              y={PAD.top}
              width={Math.max(0, width - PAD.left - PAD.right + 24)}
              height={height - PAD.top - PAD.bottom}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>
          {hover !== null && (
            <div
              className={cn('pointer-events-none absolute top-2 z-10 rounded-xl border border-white/10 bg-ink-950/95 px-3 py-2 text-xs shadow-xl')}
              style={{ left: Math.min(Math.max(x(hover) + 12, 0), width - 170) }}
            >
              <div className="mb-1 font-semibold text-white">{xLabels[hover]}</div>
              {series.map((s) => (
                <div key={s.key} className="flex items-center gap-2 text-ink-200">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden />
                  <span>{s.label}</span>
                  <span className="ml-auto pl-3 font-semibold tabular-nums text-white">
                    {s.values[hover] !== undefined ? format(s.values[hover]) : 'n/a'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </figure>
  );
}
