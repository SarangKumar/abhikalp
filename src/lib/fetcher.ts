/** Client-side JSON fetch that throws the API's `message` on failure. */
export async function api<T = unknown>(
  url: string,
  init?: Omit<RequestInit, "body"> & { body?: unknown }
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(
      (data as { message?: string }).message ?? `Request failed (${res.status})`
    );
  return data as T;
}
