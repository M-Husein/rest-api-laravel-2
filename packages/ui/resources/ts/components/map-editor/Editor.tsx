import '@/style/components/map-editor.scss';
import { useRef, useState, useMemo } from "react";
import type { MenuProps } from 'antd';
import { Layout, Radio, Space, Upload } from "antd";
import { GrUpload } from "react-icons/gr";
import type { ShapeType, Annotation, EditorProps } from './parts/types';
import { Sider, ContextMenu, RotateHandle } from './parts/components';
import {
  MIN_SIZE, 
  handleCursors, 
  uid, 
  clamp, 
  noDefault, 
  calculateAngleToMouse, 
} from './parts/utils';

export const Editor = ({
  height, 
  src,
  value = [],
  uploadProps,
  onChange,
}: EditorProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<ShapeType>("rect");
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>('');

  // Interaction States
  const [draft, setDraft] = useState<any>(null);
  const [start, setStart] = useState<any>(null);
  const [dragging, setDragging] = useState<any>(null);
  const [resizing, setResizing] = useState<any>(null);
  const [rotating, setRotating] = useState<{ id: string, initialRectAngle: number, initialPointerAngle: number } | null>(null);
  const [menuConfig, setMenuConfig] = useState<{ x: number, y: number, target: Annotation } | null>(null);

  const emit = (data: Annotation[]) => onChange?.(data);

  const getPos = (e: React.PointerEvent | PointerEvent) => {
    const svg = svgRef.current;
    if (!svg || !dims) return { x: 0, y: 0 };
    
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformed = point.matrixTransform(svg.getScreenCTM()?.inverse());

    // Return RAW normalized coordinates
    return { 
      x: transformed.x / dims.w, 
      y: transformed.y / dims.h 
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if(e.button !== 0 || !src || dragging || resizing || rotating) return;
    if(e.target === svgRef.current) setSelectedId('');

    const p = getPos(e);

    // CHECK BOUNDARIES: Is the pointer within the image area?
    const isInside = p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1;
    if (!isInside) {
      setSelectedId(''); // Optional: Deselect if clicking outside the image
      return;
    }

    if (mode === 'point') {
      const n = { id: uid(), type: 'point' as const, x: p.x, y: p.y };
      emit([...value, n]); setSelectedId(n.id);
    } else {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      setStart(p);
      setDraft({ x: p.x, y: p.y, w: 0, h: 0 });
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const rawP = getPos(e);
    const position = {
      x: clamp(rawP.x),
      y: clamp(rawP.y)
    };

    if (rotating && dims) {
      const { id, initialRectAngle, initialPointerAngle } = rotating;
      emit(value.map(a => {
        if (a.id !== id || a.type !== 'rect') return a;
        const center = { x: a.x + (a.w || 0) / 2, y: a.y + (a.h || 0) / 2 };
        // Use rawP for rotation so the angle calculation works even outside the image
        const currAngle = calculateAngleToMouse(dims, center, rawP);
        const delta = currAngle - initialPointerAngle;
        return { ...a, angle: (initialRectAngle + delta + 360) % 360 };
      }));
      return; 
    }

    if (dragging) {
      const { id, offsetX, offsetY } = dragging;
      emit(value.map((a) => {
        if (a.id !== id) return a;
        
        // 1. Calculate preferred position
        const nx = rawP.x - offsetX;
        const ny = rawP.y - offsetY;

        // 2. Clamp so the box doesn't go off the left/top (0)
        // or the right/bottom (1 - width/height)
        const x = a.type === "rect" ? Math.max(0, Math.min(nx, 1 - (a.w || 0))) : clamp(nx);
        const y = a.type === "rect" ? Math.max(0, Math.min(ny, 1 - (a.h || 0))) : clamp(ny);

        return { ...a, x, y };
      }));
    } else if (resizing) {
      const { id, handle } = resizing;
      emit(value.map((item) => {
        if (item.id !== id || item.type !== "rect") return item;
        let { x, y, w = 0, h = 0 } = item;
        
        // Use clamped 'p' to ensure resizing stops at image edges
        if (handle.includes("e")){
          w = clamp(position.x - x);
        }
        if (handle.includes("w")){ 
          const nx = clamp(position.x); 
          w += x - nx; 
          x = nx;
        }
        if (handle.includes("s")){
          h = clamp(position.y - y);
        }
        if (handle.includes("n")){
          const ny = clamp(position.y);
          h += y - ny;
          y = ny;
        }
        
        return { 
          ...item, 
          x, 
          y, 
          w: Math.max(w, MIN_SIZE), 
          h: Math.max(h, MIN_SIZE) 
        };
      }));
    } else if (start) {
      // Clamping the draft ensures new boxes stop at the image border
      setDraft({
        x: Math.min(start.x, position.x),
        y: Math.min(start.y, position.y),
        w: Math.max(Math.abs(position.x - start.x), MIN_SIZE),
        h: Math.max(Math.abs(position.y - start.y), MIN_SIZE),
      });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    
    // Release capture for whichever element had it
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {
      // Pointer capture wasn't held — safe to ignore.
    }

    if (start && draft && !dragging && !resizing && !rotating) {
      const newRect = { id: uid(), type: "rect" as const, ...draft, angle: 0 };
      emit([...value, newRect]);
      setSelectedId(newRect.id);
    }

    setDraft(null);
    setStart(null);
    setDragging(null);
    setResizing(null);
    setRotating(null);
  };

  const handlePointerUpOnHandle = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      // Pointer capture wasn't held — safe to ignore.
    }
    setDragging(null);
    setResizing(null);
    setRotating(null);
  }

  // Helper to generate handle coordinates
  const getHandles = (a: Annotation) => {
    if (a.type !== 'rect' || !a.w || !a.h) return [];
    const midX = a.x + a.w / 2;
    const midY = a.y + a.h / 2;
    const right = a.x + a.w;
    const bottom = a.y + a.h;
    // const offset = 0.05; // Offset for rotation handle

    return [
      // Corners
      { key: "nw", x: a.x, y: a.y },
      { key: "ne", x: right, y: a.y },
      { key: "se", x: right, y: bottom },
      { key: "sw", x: a.x, y: bottom },
      // Mid-points (Sides)
      { key: "n", x: midX, y: a.y },
      { key: "s", x: midX, y: bottom },
      { key: "e", x: right, y: midY },
      { key: "w", x: a.x, y: midY },
      // { key: "rot", x: right + offset, y: a.y - offset } // Rotation handle
    ];
  };

  const handleDelete = (id: string) => {
    emit(value.filter((v) => v.id !== id));
    if (selectedId === id) setSelectedId('');
    setMenuConfig(null); // Close menu
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (!menuConfig) return;
    
    if (key === 'delete') {
      handleDelete(menuConfig.target.id);
    } else if (key === 'edit') {
      setSelectedId(menuConfig.target.id);
    }
    setMenuConfig(null);
  };

  const handleContextMenuMarker = (a: Annotation) => (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    // Use clientX/Y to position the menu relative to the viewport
    setMenuConfig({
      x: e.clientX,
      y: e.clientY,
      target: a,
    });
  }

  const startDrag = (a: Annotation) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    setSelectedId(a.id); 
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = getPos(e);
    
    setDragging({ 
      id: a.id, 
      offsetX: p.x - a.x, 
      offsetY: p.y - a.y 
    }); 
  }

  const startResize = (a: Annotation, handle: any) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);

    setResizing({ id: a.id, handle: handle.key }); // Fixed 'handle' vs 'hnd' to match your onPointerMove
    
    // // Note: using 'key' here to match getHandles
    // if (handle.key === "rot") {
    //   const center = { x: a.x + (a.w || 0) / 2, y: a.y + (a.h || 0) / 2 };
    //   const mouse_normalized = getPos(e);
    //   const startAngle = calculateAngleToMouse(dims as { w: number, h: number }, center, mouse_normalized);
    //   setRotating({ id: a.id, initialRectAngle: a.angle || 0, initialPointerAngle: startAngle });
    // } else {
    //   setResizing({ id: a.id, handle: handle.key }); // Fixed 'handle' vs 'hnd' to match your onPointerMove
    // }
  };

  const handleRotateStart = (
    e: React.PointerEvent,
    annotation: Annotation,
    dims: { w: number; h: number } | null
  ) => {
    if (!dims) return;
    e.stopPropagation();

    // Set capture on the handle itself so it tracks even if mouse leaves the circle
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const center = {
      x: annotation.x + (annotation.w || 0) / 2,
      y: annotation.y + (annotation.h || 0) / 2
    };

    const mouse_normalized = getPos(e);
    const startAngle = calculateAngleToMouse(dims, center, mouse_normalized);

    setRotating({
      id: annotation.id,
      initialRectAngle: annotation.angle || 0,
      initialPointerAngle: startAngle,
    });
  };

  const handleLoadImage = (e: any) => setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });

  const activeItem = useMemo(() => 
    value.find(v => v.id === selectedId), 
    [value, selectedId]
  );

  return (
    <Layout 
      className="overflow-hidden bg-white" 
      style={{ height: height ?? '100vh' }}
      onContextMenu={noDefault}
    >
      <Layout>
        <div className="bg-white border-b p-2 flex justify-between items-center shadow-sm z-10">
          <Space>
            <label htmlFor="inputFile" className="cursor-pointer">
              Insert File
            </label>
            <Radio.Group 
              buttonStyle="solid"
              value={mode} 
              onChange={(e) => setMode(e.target.value)}
            >
              <Radio.Button value="rect">Rectangle</Radio.Button>
              <Radio.Button value="point">Point</Radio.Button>
            </Radio.Group>
            <p className="mb-0 text-xs">
              {mode === 'rect' ? 'Click and drag to draw' : 'Click to drop points'}
            </p>
          </Space>
          <h1 className="mb-0 text-sm">Map Editor</h1>
        </div>

        <Layout.Content 
          className="relative flex items-center justify-center"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}  
        >
          <div 
            className="relative w-full h-full bg-white flex items-center justify-center"
            style={{ 
              aspectRatio: dims ? `${dims.w} / ${dims.h}` : 'auto' 
            }}
          >
            <Upload.Dragger
              id="inputFile"
              className={src ? "hidden " : "absolute inset-0"}
              pastable={!src}
              accept=".jpg,.jpeg,.png,.gif,.webp,.mp4"
              {...uploadProps}
            >
              <GrUpload size={47} />
              <p className="text-base mt-4 mb-2">Click or drag file to this area to upload</p>
              <p className="text-gray-500 mb-0">
                jpg, jpeg, png, gif, webp, mp4
              </p>
            </Upload.Dragger>

            {src && (
              <img
                alt=""
                src={src}
                onLoad={handleLoadImage}
                draggable={false}
                className="block max-w-full max-h-full pointer-events-none select-none"
              />
            )}

            {dims && src && (
              <svg
                ref={svgRef}
                viewBox={`0 0 ${dims.w} ${dims.h}`}
                // preserveAspectRatio="xMidYMid meet"
                className="absolute inset-0 w-full h-full touch-none" // cursor-crosshair 
                onPointerDown={onPointerDown}
                // onPointerMove={onPointerMove}
                // onPointerUp={onPointerUp}
              >
                {value.map((a) => {
                  const isSel = selectedId === a.id;
                  const x = a.x * dims.w, y = a.y * dims.h;
                  const w = (a.w || 0) * dims.w, h = (a.h || 0) * dims.h;
                  const cx = x + w / 2, cy = y + h / 2;

                  return (
                    <g 
                      key={a.id} 
                      transform={a.angle ? `rotate(${a.angle} ${cx} ${cy})` : void 0}
                      className="cursor-move"
                      onContextMenu={handleContextMenuMarker(a)}
                    >
                      {a.type === "point" ? (
                        <line 
                          x1={x} 
                          y1={y} 
                          x2={x} 
                          y2={y} 
                          fill={isSel ? "rgba(22,119,255,0.2)" : "rgba(22,119,255,0.05)"} 
                          stroke="#1677ff" 
                          strokeWidth={isSel ? 12 : 11}
                          className="dot ve-nss"
                          onPointerDown={startDrag(a)}
                          // onContextMenu={handleContextMenuMarker(a)}
                        />
                      ) : (
                        <>
                          <rect
                            x={x} 
                            y={y} 
                            width={w} 
                            height={h}
                            stroke="#1677ff" 
                            strokeWidth={isSel ? 4 : 3}
                            fill={isSel ? "rgba(22,119,255,0.2)" : "rgba(22,119,255,0.05)"}
                            // vectorEffect="non-scaling-stroke"
                            className="ve-nss"
                            onPointerDown={startDrag(a)}
                            // onContextMenu={handleContextMenuMarker(a)}
                          />
                          {isSel && getHandles(a).map(handle => (
                            <line 
                              key={handle.key} 
                              x1={handle.x * dims.w} 
                              y1={handle.y * dims.h} 
                              x2={handle.x * dims.w} 
                              y2={handle.y * dims.h}
                              className="dot rhand ve-nss"
                              style={{ cursor: handleCursors[handle.key] }}
                              onPointerDown={startResize(a, handle)}
                            />
                          ))}
                        </>
                      )}
                    </g>
                  );
                })}
                
                {draft && (
                  <rect 
                    x={draft.x * dims.w} 
                    y={draft.y * dims.h} 
                    width={draft.w * dims.w} 
                    height={draft.h * dims.h} 
                    stroke="#faad14" 
                    strokeWidth={2} 
                    fill="rgba(250,173,20,0.1)" 
                    strokeDasharray="5,5" 
                  />
                )}
              </svg>
            )}

            <RotateHandle
              dims={dims}
              activeItem={activeItem}
              onPointerDown={(e: any) => handleRotateStart(e, activeItem as Annotation, dims)}
              onPointerUp={handlePointerUpOnHandle}
            />
          </div>
        </Layout.Content>
      </Layout>

      <Layout.Sider
        width={275}
        theme="light"
        className="border-l border-gray-200"
        collapsible={false}
        trigger={null}
      >
        <Sider
          data={selectedId}
          activeItem={activeItem}
          onClickDelete={() => handleDelete(selectedId as string)}
          onChangeLabel={(e: any) => {
            emit(value.map(v => v.id === selectedId ? { ...v, meta: { ...v.meta, label: e.target.value } } : v));
          }}
          onChangeAngleSlider={(val: any) => {
            emit(value.map(v => v.id === selectedId ? { ...v, angle: val } : v));
          }}
          onChangeAngleInput={(val: any) => {
            emit(value.map(v => v.id === selectedId ? { ...v, angle: val ?? 0 } : v));
          }}
          onClickDone={() => setSelectedId('')}
        />
      </Layout.Sider>

      <ContextMenu
        menu={menuConfig}
        onClick={handleMenuClick}
        onOpenChange={(open: any) => !open && setMenuConfig(null)}
      />
    </Layout>
  );
};

/* <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
  <Text strong className="block text-blue-800">Geometry Data</Text>
  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
    <Text type="secondary" className="text-[11px]">X: {selected.x.toFixed(4)}</Text>
    <Text type="secondary" className="text-[11px]">Y: {selected.y.toFixed(4)}</Text>
    {selected.type === 'rect' && (
      <>
        <Text type="secondary" className="text-[11px]">W: {selected.w?.toFixed(4)}</Text>
        <Text type="secondary" className="text-[11px]">H: {selected.h?.toFixed(4)}</Text>
      </>
    )}
  </div>
</div> */
