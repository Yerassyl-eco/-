import { useEffect, useState } from 'react';
import { visionRuntime } from '../../vision/VisionRuntime';

/** `?debug`: live camera and model diagnostics, for troubleshooting on a real device. */
export function DebugPanel() {
  const [info, setInfo] = useState(() => visionRuntime.debugInfo());
  useEffect(() => {
    const id = setInterval(() => setInfo(visionRuntime.debugInfo()), 500);
    return () => clearInterval(id);
  }, []);
  return (
    <pre className="num fixed bottom-3 left-3 z-50 max-w-[min(92vw,520px)] whitespace-pre-wrap rounded-xl bg-scope/90 p-3 text-[11px] leading-snug text-white">
      {Object.entries(info)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join('\n')}
    </pre>
  );
}
