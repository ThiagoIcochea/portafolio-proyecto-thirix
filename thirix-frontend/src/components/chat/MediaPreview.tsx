import { Download } from "lucide-react";

interface Props {
  url: string;
  type: string;
  onOpen: (url: string, type: string) => void;
}

export default function MediaPreview({
  url,
  type,
  onOpen
}: Props) {
  if (type === "image") {
    return (
      <div className="relative group">
        <img
          src={url}
          alt=""
          onClick={() => onOpen(url, type)}
          className="rounded-lg max-h-60 cursor-pointer"
        />

        <a
          href={url}
          download
          target="_blank"
          rel="noreferrer"
          className="absolute top-2 right-2
          bg-black/60 text-white p-2 rounded-full
          opacity-0 group-hover:opacity-100"
        >
          <Download size={16} />
        </a>
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className="relative group">
        <video
          src={url}
          className="rounded-lg max-h-60 cursor-pointer"
          onClick={() => onOpen(url, type)}
        />

        <a
          href={url}
          download
          target="_blank"
          rel="noreferrer"
          className="absolute top-2 right-2
          bg-black/60 text-white p-2 rounded-full
          opacity-0 group-hover:opacity-100"
        >
          <Download size={16} />
        </a>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="underline"
    >
      Archivo adjunto
    </a>
  );
}