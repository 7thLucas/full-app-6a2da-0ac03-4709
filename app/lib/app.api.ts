import { apiRequest } from "~/lib/api.client";
import { useCallback, useEffect, useState } from "react";

async function get<T>(path: string, params?: Record<string, any>): Promise<T | null> {
  const res = await apiRequest<T>(path, { method: "GET", params });
  return res.success ? (res.data as T) : null;
}
async function send<T>(method: string, path: string, data?: any): Promise<T | null> {
  const res = await apiRequest<T>(path, { method, data });
  return res.success ? (res.data as T) : null;
}

export const api = {
  get,
  post: <T>(p: string, d?: any) => send<T>("POST", p, d),
  patch: <T>(p: string, d?: any) => send<T>("PATCH", p, d),
  del: <T>(p: string) => send<T>("DELETE", p),
};

/** Generic fetch-on-mount hook with manual refetch + loading state. */
export function useApi<T>(
  path: string | null,
  params?: Record<string, any>,
  deps: any[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const key = JSON.stringify(params ?? {});

  const refetch = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    const result = await get<T>(path, params);
    setData(result);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key]);

  useEffect(() => {
    let active = true;
    if (!path) {
      setLoading(false);
      return;
    }
    setLoading(true);
    get<T>(path, params).then((result) => {
      if (active) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key, ...deps]);

  return { data, loading, refetch, setData };
}
