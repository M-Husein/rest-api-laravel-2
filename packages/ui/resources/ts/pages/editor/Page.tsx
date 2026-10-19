import { useState } from 'react';
import { Editor } from '@/components/map-editor/Editor';

export default function Page() {
  const [mediaSrc, setMediaSrc] = useState<any>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);

  return (
    <>
      <Editor
        src={mediaSrc?.size ? URL.createObjectURL(mediaSrc) : mediaSrc} // "/logo-144x144.png"
        value={annotations}
        onChange={setAnnotations}
        uploadProps={{
          showUploadList: false,
          beforeUpload: (file: any) => {
            // console.log('file: ', file);
            setMediaSrc(file);
            return false;
          }
        }}
      />
    </>
  );
}
