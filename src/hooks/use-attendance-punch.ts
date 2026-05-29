"use client";

import { message } from "antd";
import { useCallback, useState } from "react";

export type WorkSite = "office" | "field";

function getLocation() {
  return new Promise<{ lat: number; lng: number; accuracy?: number }>(
    (resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error("GPS not supported in this browser"));
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }),
        (err) => reject(new Error(err.message || "Failed to get location")),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
  );
}

export function useAttendancePunch(options?: { source?: "web" | "mobile" }) {
  const [punching, setPunching] = useState<"in" | "out" | null>(null);
  const source = options?.source ?? "web";

  const punch = useCallback(
    async (type: "in" | "out", workSite: WorkSite = "office") => {
      setPunching(type);
      try {
        message.loading({
          content: "Getting your location…",
          key: "punch",
          duration: 0,
        });
        const coords = await getLocation();

        message.loading({ content: "Saving punch…", key: "punch", duration: 0 });
        const endpoint =
          type === "in"
            ? "/api/hrms/attendance/punch-in"
            : "/api/hrms/attendance/punch-out";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            location: coords,
            source,
            workSite,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json?.error) {
          throw new Error(json?.error || "Punch failed");
        }

        const loc = json?.data?.punch?.location;
        const addr =
          loc?.city && loc?.state
            ? `${loc.city}, ${loc.state}`
            : loc?.address?.split(",").slice(-3, -1).join(", ").trim() || "";

        const label = type === "in" ? "Punched In" : "Punched Out";
        message.success({
          content: addr ? `${label} · ${addr}` : label,
          key: "punch",
          duration: 5,
        });
        return true;
      } catch (e) {
        message.error({
          content: e instanceof Error ? e.message : "Punch failed",
          key: "punch",
        });
        return false;
      } finally {
        setPunching(null);
      }
    },
    [source]
  );

  return { punch, punching };
}
