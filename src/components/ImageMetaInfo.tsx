import { useCurrentImageInfo } from "@/hooks/streetscapes";
import { MoveUpIcon } from "lucide-react";

type ImageInfo = NonNullable<ReturnType<typeof useCurrentImageInfo>["data"]>;

function formatNumber(
  value: number | null | undefined,
  decimals: number,
): string {
  return value == null ? "N/A" : value.toFixed(decimals);
}

export function ImageMetaInfo({ info }: { info: ImageInfo }) {
  const osmUrl = `https://www.openstreetmap.org/?mlat=${info.lat}&mlon=${info.lon}#map=14/${info.lat}/${info.lon}`;
  const source = info.source ?? "N/A";

  return (
    <div className="space-y-2">
      <div>
        Captured at:{" "}
        {info.captured_at ? new Date(info.captured_at).toLocaleString() : "N/A"}
      </div>
      <div>
        Compass (°): {formatNumber(info.compass_angle, 2)}{" "}
        <MoveUpIcon
          className="inline"
          style={{ transform: `rotate(${info.compass_angle ?? 0}deg)` }}
        />
      </div>
      <div>Altitude (m): {formatNumber(info.altitude, 2)}</div>
      <div>
        Location:{" "}
        <a href={osmUrl} target="_blank" rel="noreferrer" className="underline">
          {formatNumber(info.lon, 5)}, {formatNumber(info.lat, 5)}
        </a>
      </div>
      <div>
        Size: {info.width} x {info.height} px
      </div>
      <div>
        Source:{" "}
        {source === "mapillary" ? (
          <a
            href="https://www.mapillary.com/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {source}
          </a>
        ) : (
          source
        )}
      </div>
    </div>
  );
}
