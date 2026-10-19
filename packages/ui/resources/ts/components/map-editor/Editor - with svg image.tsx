import { useRef, useState } from "react";
import type { MenuProps } from 'antd';
import { Button, Layout, Input, Radio, Space, Typography, Upload, Dropdown } from "antd";
import { DeleteOutlined, InboxOutlined, EditOutlined } from "@ant-design/icons"; // , DragOutlined

type ShapeType = "rect" | "point";

type Annotation = {
  id: string;
  type: ShapeType;
  x: number; // 0 to 1 (relative to image width)
  y: number; // 0 to 1 (relative to image height)
  w?: number; // 0 to 1
  h?: number; // 0 to 1
  meta?: {
    label?: string;
  };
};

type EditorProps = {
  src?: string;
  value?: Annotation[];
  onChange?: (v: Annotation[]) => void;
  uploadProps?: any;
};

const { Text } = Typography;
const uid = () => crypto.randomUUID();
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const MIN_SIZE = 0.005; // 0.5% minimum size, smaller min size for 0-1 scale

// Cursors mapping for handles
const handleCursors: Record<string, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
};

export const Editor = ({
  src,
  value = [],
  uploadProps,
  onChange,
}: EditorProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<ShapeType>("rect");
  const [draft, setDraft] = useState<any>(null);
  const [start, setStart] = useState<any>(null);
  const [selected, setSelected] = useState<Annotation | null>(null);
  const [dragging, setDragging] = useState<any>(null);
  const [resizing, setResizing] = useState<any>(null);
  const [menuConfig, setMenuConfig] = useState<{ x: number, y: number, target: Annotation } | null>(null);

  const emit = (data: Annotation[]) => onChange?.(data);

  // Map client coordinates to SVG coordinate space
  const getPos = (e: React.PointerEvent | PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformed = point.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: clamp(transformed.x), y: clamp(transformed.y) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // Only allow the primary (left) mouse button
    if (e.button !== 0) return;

    if (!src || dragging || resizing) return;
    
    // Capture background clicks to deselect
    if (e.target === svgRef.current || (e.target as Element).tagName === 'image') {
      setSelected(null);
    }

    const p = getPos(e);
    if (mode === "point") {
      const newPoint = { id: uid(), type: "point" as const, x: p.x, y: p.y };
      emit([...value, newPoint]);
      setSelected(newPoint);
      return;
    }

    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setStart(p);
    setDraft({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = getPos(e);

    if (dragging) {
      const { id, offsetX, offsetY } = dragging;
      emit(
        value.map((a) => {
          if (a.id !== id) return a;
          let x = clamp(p.x - offsetX);
          let y = clamp(p.y - offsetY);

          if (a.type === "rect") {
            x = Math.min(x, 1 - (a.w || 0));
            y = Math.min(y, 1 - (a.h || 0));
          }
          return { ...a, x, y };
        })
      );
      return;
    }

    if (resizing) {
      const { id, handle } = resizing;
      emit(
        value.map((a) => {
          if (a.id !== id || a.type !== "rect") return a;
          let { x, y, w = 0, h = 0 } = a;

          // East/West logic
          if (handle.includes("e")) w = clamp(p.x - x);
          if (handle.includes("w")) {
            const nx = clamp(p.x);
            w += x - nx;
            x = nx;
          }

          // North/South logic
          if (handle.includes("s")) h = clamp(p.y - y);
          if (handle.includes("n")) {
            const ny = clamp(p.y);
            h += y - ny;
            y = ny;
          }

          return { ...a, x, y, w: Math.max(w, MIN_SIZE), h: Math.max(h, MIN_SIZE) };
        })
      );
      return;
    }

    if (!start) return;

    setDraft({
      x: Math.min(start.x, p.x),
      y: Math.min(start.y, p.y),
      w: Math.max(Math.abs(p.x - start.x), MIN_SIZE),
      h: Math.max(Math.abs(p.y - start.y), MIN_SIZE),
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    // Ensure we are finishing a left-click action
    if (e.button !== 0) return;

    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      // Pointer capture wasn't held — safe to ignore.
    }

    if (start && draft && !dragging && !resizing) {
      const newRect = { id: uid(), type: "rect" as const, ...draft };
      emit([...value, newRect]);
      setSelected(newRect);
    }
    
    // Always clean up states
    setDraft(null);
    setStart(null);
    setDragging(null);
    setResizing(null);
  };

  const startDrag = (a: Annotation) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelected(a);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = getPos(e);
    setDragging({ id: a.id, offsetX: p.x - a.x, offsetY: p.y - a.y });
  };

  const startResize = (e: React.PointerEvent, id: string, handle: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setResizing({ id, handle });
  };

  // Helper to generate handle coordinates
  const getHandles = (a: Annotation) => {
    if (a.type !== 'rect' || !a.w || !a.h) return [];
    const midX = a.x + a.w / 2;
    const midY = a.y + a.h / 2;
    const right = a.x + a.w;
    const bottom = a.y + a.h;

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
    ];
  };

  const handlePointerUpOnShape = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      // Pointer capture wasn't held — safe to ignore.
    }
    setDragging(null);
    setResizing(null);
  }

  const handleSelect = (a: any) => (e: any) => { 
    e.stopPropagation(); 
    setSelected(a); 
  };

  const handleDelete = (id: string) => {
    emit(value.filter((v) => v.id !== id));
    if (selected?.id === id) setSelected(null);
    setMenuConfig(null); // Close menu
  };

  const onContextMenu = (e: React.MouseEvent, a: Annotation) => {
    e.preventDefault();
    e.stopPropagation();
    // Use clientX/Y to position the menu relative to the viewport
    setMenuConfig({
      x: e.clientX,
      y: e.clientY,
      target: a,
    });
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (!menuConfig) return;
    
    if (key === 'delete') {
      handleDelete(menuConfig.target.id);
    } else if (key === 'edit') {
      setSelected(menuConfig.target);
    }
    setMenuConfig(null);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />, // <b className="mr-1">✏️</b>
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />, // <b className="mr-1">🗑️</b>
    },
  ];

  return (
    <Layout 
      className="overflow-hidden bg-white"
      style={{
        height: 'calc(100vh - 112px)'
      }}
    >
      {menuConfig && (
        <Dropdown
          menu={{ 
            items: menuItems, 
            onClick: handleMenuClick 
          }}
          trigger={['contextMenu']}
          open={!!menuConfig}
          onOpenChange={(open) => !open && setMenuConfig(null)}
        >
          <div 
            style={{ 
              position: 'fixed', 
              left: menuConfig.x, 
              top: menuConfig.y, 
              width: 1, 
              height: 1 
            }} 
          />
        </Dropdown>
      )}

      <Layout>
        <div className="bg-white border-b p-2 flex justify-between items-center shadow-sm z-10">
          <Space>
            <label htmlFor="inputFile" className="cursor-pointer">
              Insert File
            </label>
            <Radio.Group 
              value={mode} 
              onChange={(e) => setMode(e.target.value)} 
              buttonStyle="solid"
            >
              <Radio.Button value="rect">Rectangle</Radio.Button>
              <Radio.Button value="point">Point</Radio.Button>
            </Radio.Group>
            <Text type="secondary" className="text-xs italic">
              {mode === 'rect' ? 'Click and drag to draw' : 'Click to drop points'}
            </Text>
          </Space>
          
          <Text strong className="text-blue-600">Map Editor</Text>
        </div>

        <Layout.Content className="relative bg-gray-100 flex items-center justify-center p-2">
          <div className="relative w-full h-full flex items-center justify-center">
            <Upload.Dragger
              id="inputFile"
              className={(src ? "hidden " : "") + "absolute inset-0"}
              pastable
              accept=".jpg,.jpeg,.png,.gif,.webp,.mp4"
              {...uploadProps}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                jpg, jpeg, png, gif, webp, mp4
              </p>
            </Upload.Dragger>

            <svg
              ref={svgRef}
              className="max-w-full max-h-full aspect-square touch-none bg-white border border-gray-300"
              viewBox="0 0 1 1"
              preserveAspectRatio="xMidYMid meet"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {src && (
                <image href={src} x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid meet" />
              )}

              {value.map((a) => {
                const isSel = selected?.id === a.id;
                return (
                  <g key={a.id}>
                    {a.type === "point" ? (
                      <circle 
                        cx={a.x} cy={a.y} r={0.012} 
                        fill={isSel ? "#1677ff" : "#ff4d4f"} 
                        stroke="#fff"
                        strokeWidth={0.002}
                        className="cursor-move"
                        onPointerDown={startDrag(a)}
                        onPointerUp={handlePointerUpOnShape}
                        onClick={handleSelect(a)}
                        onContextMenu={(e) => onContextMenu(e, a)}
                      />
                    ) : (
                      <>
                        <rect
                          x={a.x} 
                          y={a.y} 
                          width={a.w} 
                          height={a.h}
                          stroke="#1677ff"
                          strokeWidth={isSel ? 0.005 : 0.003}
                          fill={isSel ? "rgba(22,119,255,0.15)" : "rgba(22,119,255,0.05)"}
                          className="cursor-move"
                          onPointerDown={startDrag(a)}
                          onPointerUp={handlePointerUpOnShape}
                          onClick={handleSelect(a)}
                          onContextMenu={(e) => onContextMenu(e, a)}
                        />
                        {/* Render Handles */}
                        {isSel && getHandles(a).map((h) => (
                          <circle
                            key={h.key} 
                            cx={h.x} 
                            cy={h.y} 
                            r={0.01} // Handle size
                            fill="#fff" 
                            stroke="#1677ff" 
                            strokeWidth={0.002}
                            style={{ cursor: handleCursors[h.key] }}
                            onPointerDown={(e) => startResize(e, a.id, h.key)}
                            onPointerUp={handlePointerUpOnShape}
                          />
                        ))}
                      </>
                    )}
                  </g>
                );
              })}

              {draft && (
                <rect
                  x={draft.x} 
                  y={draft.y} 
                  width={draft.w} 
                  height={draft.h}
                  stroke="#faad14" 
                  strokeWidth={0.002} 
                  fill="rgba(250,173,20,0.1)"
                  strokeDasharray="0.01 0.01"
                />
              )}
            </svg>
          </div>
        </Layout.Content>
      </Layout>

      <Layout.Sider
        width={275}
        theme="light"
        className="border-l border-gray-200"
        // collapsed={!selected}
        // collapsedWidth={0}
        collapsible={false}
        trigger={null}
      >
        {!!selected && (
          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <Typography.Title level={4} style={{ margin: 0 }}>Properties</Typography.Title>
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => {
                  emit(value.filter(v => v.id !== selected?.id));
                  setSelected(null);
                }}
              />
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <label htmlFor="lname">Label Name</label>
                <Input
                  id="lname"
                  className="mt-1"
                  value={selected.meta?.label}
                  onChange={(e) => {
                    emit(value.map(v => v.id === selected.id ? { ...v, meta: { ...v.meta, label: e.target.value } } : v));
                  }}
                />
              </div>

              {/* <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
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
              </div> */}

              <div className="mt-auto">
                <Button block type="primary" onClick={() => setSelected(null)}>
                  Done Editing
                </Button>
              </div>
            </div>
          </div>
        )}
      </Layout.Sider>
    </Layout>
  );
};
