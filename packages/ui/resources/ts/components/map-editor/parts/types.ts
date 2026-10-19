export type ShapeType = "rect" | "point";

export type Annotation = {
  id: string;
  type: ShapeType;
  x: number; // 0 to 1
  y: number; // 0 to 1
  w?: number; // 0 to 1
  h?: number; // 0 to 1
  angle?: number; // degrees, [0, 360)
  meta?: { label?: string };
};

export type EditorProps = {
  height?: number | string,
  src?: string;
  value?: Annotation[];
  onChange?: (v: Annotation[]) => void;
  uploadProps?: any;
};
