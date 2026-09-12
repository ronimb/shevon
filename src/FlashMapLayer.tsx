import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { KeyStyle } from './types.ts';
import { formatKeyStylesSource, isNavKey, keyBorderRadius } from './keys.ts';

type DragMode = 'move' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const HANDLES: { id: Exclude<DragMode, 'move'>; cursor: string; className: string }[] = [
  { id: 'nw', cursor: 'nwse-resize', className: 'flash-map-handle flash-map-handle-nw' },
  { id: 'n', cursor: 'ns-resize', className: 'flash-map-handle flash-map-handle-n' },
  { id: 'ne', cursor: 'nesw-resize', className: 'flash-map-handle flash-map-handle-ne' },
  { id: 'e', cursor: 'ew-resize', className: 'flash-map-handle flash-map-handle-e' },
  { id: 'se', cursor: 'nwse-resize', className: 'flash-map-handle flash-map-handle-se' },
  { id: 's', cursor: 'ns-resize', className: 'flash-map-handle flash-map-handle-s' },
  { id: 'sw', cursor: 'nesw-resize', className: 'flash-map-handle flash-map-handle-sw' },
  { id: 'w', cursor: 'ew-resize', className: 'flash-map-handle flash-map-handle-w' },
];

function applyDrag(initial: KeyStyle, dx: number, dy: number, mode: DragMode): KeyStyle {
  let { top, left, width, height } = initial;
  const min = 12;
  if (mode === 'move') {
    return {
      top: Math.round(top + dy),
      left: Math.round(left + dx),
      width,
      height,
    };
  }
  if (mode.includes('n')) {
    const nextH = Math.max(min, height - dy);
    top += height - nextH;
    height = nextH;
  }
  if (mode.includes('s')) {
    height = Math.max(min, height + dy);
  }
  if (mode.includes('w')) {
    const nextW = Math.max(min, width - dx);
    left += width - nextW;
    width = nextW;
  }
  if (mode.includes('e')) {
    width = Math.max(min, width + dx);
  }
  return {
    top: Math.round(top),
    left: Math.round(left),
    width: Math.round(width),
    height: Math.round(height),
  };
}

interface FlashMapLayerProps {
  styles: Record<string, KeyStyle>;
  onChange: (next: Record<string, KeyStyle>) => void;
  scale: number;
  enabled: boolean;
  onToggle: () => void;
  onReset: () => void;
}

const FlashMapLayer: React.FC<FlashMapLayerProps> = ({
  styles,
  onChange,
  scale,
  enabled,
  onToggle,
  onReset,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [copied, setCopied] = useState(false);
  const dragRef = useRef<{
    id: string;
    mode: DragMode;
    startX: number;
    startY: number;
    initial: KeyStyle;
  } | null>(null);
  const stylesRef = useRef(styles);
  stylesRef.current = styles;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const ids = useMemo(() => Object.keys(styles), [styles]);
  const selected = selectedId ? styles[selectedId] : null;
  const [draft, setDraft] = useState({ left: '', top: '', width: '', height: '' });
  const focusedField = useRef<keyof KeyStyle | null>(null);

  useEffect(() => {
    if (!selected) {
      setDraft({ left: '', top: '', width: '', height: '' });
      return;
    }
    if (focusedField.current) return;
    setDraft({
      left: String(selected.left),
      top: String(selected.top),
      width: String(selected.width),
      height: String(selected.height),
    });
  }, [selected, selectedId]);

  const applyField = (field: keyof KeyStyle, raw: string) => {
    setDraft(prev => ({ ...prev, [field]: raw }));
    if (!selectedId) return;
    const trimmed = raw.trim();
    if (trimmed === '' || trimmed === '-') return;
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return;
    const rounded = Math.round(n);
    const nextVal = field === 'width' || field === 'height' ? Math.max(12, rounded) : rounded;
    const current = stylesRef.current[selectedId];
    if (!current || current[field] === nextVal) return;
    onChangeRef.current({
      ...stylesRef.current,
      [selectedId]: { ...current, [field]: nextVal },
    });
  };

  const commitField = () => {
    focusedField.current = null;
    if (!selectedId) return;
    const current = stylesRef.current[selectedId];
    if (!current) return;
    setDraft({
      left: String(current.left),
      top: String(current.top),
      width: String(current.width),
      height: String(current.height),
    });
  };

  const startDrag = (e: React.PointerEvent, id: string, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(id);
    dragRef.current = {
      id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      initial: { ...stylesRef.current[id] },
    };
    const onMove = (ev: PointerEvent | MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = (ev.clientX - drag.startX) / scaleRef.current;
      const dy = (ev.clientY - drag.startY) / scaleRef.current;
      const next = applyDrag(drag.initial, dx, dy, drag.mode);
      onChangeRef.current({ ...stylesRef.current, [drag.id]: next });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const copyMapping = useCallback(async () => {
    const text = formatKeyStylesSource(styles);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }, [styles]);

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('.flash-map-toolbar')) return;
      if (e.key === 'Tab' && ids.length) {
        e.preventDefault();
        if (!selectedId) {
          setSelectedId(e.shiftKey ? ids[ids.length - 1] : ids[0]);
          return;
        }
        const idx = ids.indexOf(selectedId);
        const nextIdx = e.shiftKey
          ? (idx - 1 + ids.length) % ids.length
          : (idx + 1) % ids.length;
        setSelectedId(ids[nextIdx]);
        return;
      }
      if (!selectedId || !styles[selectedId]) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedId(null);
        return;
      }
      const step = e.shiftKey ? 5 : 1;
      const current = styles[selectedId];
      let next: KeyStyle | null = null;
      if (e.key === 'ArrowLeft') next = { ...current, left: current.left - step };
      else if (e.key === 'ArrowRight') next = { ...current, left: current.left + step };
      else if (e.key === 'ArrowUp') next = { ...current, top: current.top - step };
      else if (e.key === 'ArrowDown') next = { ...current, top: current.top + step };
      if (!next) return;
      e.preventDefault();
      onChange({ ...stylesRef.current, [selectedId]: next });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, selectedId, styles, ids, onChange]);

  const toolbar = (
      <div className="flash-map-toolbar">
        <div className="flash-map-toolbar-title">
          Flash map
          <span className={`flash-map-pill ${enabled ? 'on' : ''}`}>{enabled ? 'ON' : 'OFF'}</span>
        </div>
        <p className="flash-map-hint">
          Overlay of press/flash areas. Type coordinates, drag to move, handles to resize, arrows nudge 1px (Shift = 5px).
        </p>
        <div className="flash-map-toolbar-row">
          <button type="button" className="flash-map-btn" onClick={onToggle}>
            {enabled ? 'Hide overlay' : 'Show overlay'}
          </button>
          <button type="button" className="flash-map-btn" onClick={() => setShowLabels(v => !v)} disabled={!enabled}>
            {showLabels ? 'Hide IDs' : 'Show IDs'}
          </button>
          <button type="button" className="flash-map-btn" onClick={copyMapping}>
            {copied ? 'Copied' : 'Copy keys.ts'}
          </button>
          <button type="button" className="flash-map-btn" onClick={onReset} disabled={!enabled}>
            Reset
          </button>
        </div>
        <div className="flash-map-toolbar-row">
          <label className="flash-map-select-label">
            Key
            <select
              value={selectedId ?? ''}
              onChange={e => setSelectedId(e.target.value || null)}
              disabled={!enabled}
            >
              <option value="">(none)</option>
              {ids.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </label>
        </div>
        {selected && selectedId && (
          <div className="flash-map-geom">
            {([
              ['left', 'Left'],
              ['top', 'Top'],
              ['width', 'Width'],
              ['height', 'Height'],
            ] as const).map(([field, label]) => (
              <label key={field} className="flash-map-geom-field">
                {label}
                <input
                  type="number"
                  step={1}
                  min={field === 'width' || field === 'height' ? 12 : undefined}
                  value={draft[field]}
                  disabled={!enabled}
                  onFocus={() => { focusedField.current = field; }}
                  onChange={e => applyField(field, e.target.value)}
                  onBlur={commitField}
                  onKeyDown={e => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </label>
            ))}
          </div>
        )}
      </div>
  );

  return (
    <>
      {createPortal(toolbar, document.body)}
      {enabled && (
        <div className="flash-map-layer">
          {ids.map(id => {
            const style = styles[id];
            if (!style) return null;
            const selectedNow = selectedId === id;
            return (
              <div
                key={id}
                role="button"
                aria-label={`flash ${id}`}
                aria-pressed={selectedNow}
                className={`flash-map-region${selectedNow ? ' selected' : ''}${isNavKey(id) ? ' nav' : ''}`}
                style={{
                  top: style.top,
                  left: style.left,
                  width: style.width,
                  height: style.height,
                  borderRadius: keyBorderRadius(id),
                }}
                onPointerDown={e => startDrag(e, id, 'move')}
              >
                {showLabels && (
                  <span className="flash-map-label">{id}</span>
                )}
                {selectedNow && HANDLES.map(handle => (
                  <div
                    key={handle.id}
                    className={handle.className}
                    style={{ cursor: handle.cursor }}
                    onPointerDown={e => startDrag(e, id, handle.id)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default FlashMapLayer;
