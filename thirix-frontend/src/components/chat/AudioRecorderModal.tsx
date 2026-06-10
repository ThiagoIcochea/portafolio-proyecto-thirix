import { useRef, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onRecorded: (file: File) => void;
}

export default function AudioRecorderModal({
  open,
  onClose,
  onRecorded
}: Props) {

  const [recording, setRecording] =
    useState(false);

  const chunks =
    useRef<Blob[]>([]);

  const recorder =
    useRef<MediaRecorder | null>(null);

  if (!open) return null;

  const startRecording =
    async () => {

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });

      recorder.current =
        new MediaRecorder(stream);

      recorder.current.ondataavailable =
        e => chunks.current.push(e.data);

      recorder.current.onstop =
        () => {

          const blob =
            new Blob(chunks.current, {
              type: "audio/webm"
            });

          const file =
            new File(
              [blob],
              "audio.webm",
              {
                type: "audio/webm"
              }
            );

          onRecorded(file);

          chunks.current = [];
        };

      recorder.current.start();
      setRecording(true);
    };

  const stopRecording =
    () => {

      recorder.current?.stop();

      setRecording(false);

      onClose();
    };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center">

      <div className="bg-white p-6 rounded-xl">

        {!recording ? (
          <button
            onClick={startRecording}
          >
            Iniciar Grabación
          </button>
        ) : (
          <button
            onClick={stopRecording}
          >
            Detener
          </button>
        )}

      </div>

    </div>
  );
}