export type CameraErrorCode =
  | 'UNSUPPORTED'
  | 'INSECURE_CONTEXT'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'IN_USE'
  | 'STREAM_ENDED'
  | 'UNKNOWN';

export class CameraError extends Error {
  constructor(
    public code: CameraErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export const CAMERA_ERROR_TEXT: Record<CameraErrorCode, { title: string; hint: string }> = {
  UNSUPPORTED: {
    title: 'Браузер не поддерживает доступ к камере',
    hint: 'Откройте сайт в актуальной версии Chrome, Edge или Safari.',
  },
  INSECURE_CONTEXT: {
    title: 'Камера доступна только по защищённому адресу',
    hint: 'Откройте сайт через https:// или по адресу http://localhost.',
  },
  PERMISSION_DENIED: {
    title: 'Для прохождения тестов необходим доступ к камере',
    hint: 'Нажмите на значок камеры в адресной строке, разрешите доступ и попробуйте снова.',
  },
  NOT_FOUND: {
    title: 'Камера не найдена',
    hint: 'Подключите веб-камеру и попробуйте снова.',
  },
  IN_USE: {
    title: 'Камера недоступна',
    hint: 'Возможно, камеру использует другое приложение (Zoom, Teams). Закройте его и попробуйте снова.',
  },
  STREAM_ENDED: {
    title: 'Соединение с камерой потеряно',
    hint: 'Проверьте подключение камеры и нажмите «Разрешить камеру».',
  },
  UNKNOWN: {
    title: 'Камера недоступна',
    hint: 'Проверьте разрешения браузера и попробуйте снова.',
  },
};

export async function openCamera(): Promise<MediaStream> {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    throw new CameraError('INSECURE_CONTEXT');
  }
  if (!navigator.mediaDevices?.getUserMedia) throw new CameraError('UNSUPPORTED');
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30, max: 30 },
      },
    });
  } catch (e) {
    const name = (e as DOMException)?.name;
    if (name === 'NotAllowedError' || name === 'SecurityError') throw new CameraError('PERMISSION_DENIED');
    if (name === 'NotFoundError' || name === 'OverconstrainedError') throw new CameraError('NOT_FOUND');
    if (name === 'NotReadableError' || name === 'AbortError') throw new CameraError('IN_USE');
    throw new CameraError('UNKNOWN', String(e));
  }
}

export function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => t.stop());
}
