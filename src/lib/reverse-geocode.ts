export type GeoLocation = {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
};

/** Short label for UI: "City, State" or trimmed display_name */
export function shortAddressFromLocation(loc: GeoLocation | null | undefined): string {
  if (!loc) return "";
  if (loc.city || loc.state) return [loc.city, loc.state].filter(Boolean).join(", ");
  if (loc.address) {
    const parts = loc.address.split(",").map((s) => s.trim()).filter(Boolean);
    return parts.slice(-3, -1).join(", ") || loc.address;
  }
  return "";
}

/** Reverse geocode lat/lng via OpenStreetMap Nominatim (server-side, no CORS). */
export async function reverseGeocode(lat: number, lng: number): Promise<Omit<GeoLocation, "lat" | "lng" | "accuracy">> {
  const buildUrl = () => {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("zoom", "18");
    return url.toString();
  };

  const parse = async (res: Response) => {
    const data = await res.json().catch(() => null);
    const a = (data as any)?.address || {};
    return {
      address: typeof (data as any)?.display_name === "string" ? (data as any).display_name : "",
      city: a.city || a.town || a.village || a.county || a.state_district || "",
      state: a.state || "",
      country: a.country || "",
    };
  };

  // Nominatim has strict rate limits; retry once on 429/5xx.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(buildUrl(), {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
          "User-Agent": "SudarshanERP/1.0 (hrms@sudarshan.co.in)",
        },
        next: { revalidate: 86400 },
      });

      if (res.ok) return await parse(res);

      if ((res.status === 429 || res.status >= 500) && attempt === 0) {
        const waitMs = 1200;
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      return { address: "", city: "", state: "", country: "" };
    } catch {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 1200));
        continue;
      }
      return { address: "", city: "", state: "", country: "" };
    }
  }

  return { address: "", city: "", state: "", country: "" };
}

/** Ensure location has address fields; geocode from lat/lng if missing. */
export async function enrichLocation(loc: GeoLocation): Promise<GeoLocation> {
  if (typeof loc?.lat !== "number" || typeof loc?.lng !== "number") return loc;

  const hasAddress = Boolean(loc.address?.trim() || loc.city?.trim() || loc.state?.trim());
  if (hasAddress) return loc;

  const geo = await reverseGeocode(loc.lat, loc.lng);
  return { ...loc, ...geo };
}
