import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "./client";
import { ApiError, ConflictError, UnauthorizedError } from "./errors";

const realFetch = globalThis.fetch;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("ApiClient", () => {
  let client: ApiClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new ApiClient("http://api.test");
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    vi.stubEnv("VITE_APP_MOCK", "0");
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.unstubAllEnvs();
  });

  it("mengirim header Authorization dan X-School-ID", async () => {
    client.setTokens("access-1", "refresh-1");
    client.setSchoolId("school-1");
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await client.get("/api/v1/users/me");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://api.test/api/v1/users/me");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer access-1");
    expect(headers["X-School-ID"]).toBe("school-1");
  });

  it("melakukan refresh sekali untuk beberapa request 401 yang bersamaan, lalu mengulang request", async () => {
    client.setTokens("expired", "refresh-abc");
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { detail: "expired" }))
      .mockResolvedValueOnce(jsonResponse(401, { detail: "expired" }))
      .mockResolvedValueOnce(
        jsonResponse(200, { access_token: "new-access", refresh_token: "new-refresh", token_type: "bearer", expires_in: 900 }),
      )
      .mockResolvedValueOnce(jsonResponse(200, { value: "a" }))
      .mockResolvedValueOnce(jsonResponse(200, { value: "b" }));

    const [a, b] = await Promise.all([client.get<{ value: string }>("/api/v1/a"), client.get<{ value: string }>("/api/v1/b")]);

    expect(a.value).toBe("a");
    expect(b.value).toBe("b");
    const refreshCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes("/auth/refresh"));
    expect(refreshCalls).toHaveLength(1);
    const retried = fetchMock.mock.calls.filter(([url]) => !String(url).includes("/auth/refresh"));
    expect(retried).toHaveLength(4);
    const lastHeaders = retried[3][1].headers as Record<string, string>;
    expect(lastHeaders.Authorization).toBe("Bearer new-access");
  });

  it("membersihkan token dan menolak saat refresh gagal", async () => {
    client.setTokens("expired", "refresh-abc");
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { detail: "expired" }))
      .mockResolvedValueOnce(jsonResponse(401, { detail: "replay detected" }));

    await expect(client.get("/api/v1/users/me")).rejects.toBeInstanceOf(UnauthorizedError);
    expect(client.isAuthenticated).toBe(false);
  });

  it("memetakan 422 menjadi field errors", async () => {
    client.setTokens("access", "refresh");
    fetchMock.mockResolvedValueOnce(
      jsonResponse(422, { detail: [{ loc: ["body", "email"], msg: "field required", type: "missing" }] }),
    );

    const err = await client.post("/api/v1/users", {}).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(422);
    expect((err as ApiError).fieldErrors).toEqual([{ field: "email", message: "field required" }]);
  });

  it("memetakan 409 sebagai ConflictError", async () => {
    client.setTokens("access", "refresh");
    fetchMock.mockResolvedValueOnce(jsonResponse(409, { detail: "revision mismatch" }));

    const err = await client.put("/api/v1/subjects/1", {}).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ConflictError);
    expect((err as ConflictError).detail).toBe("revision mismatch");
  });

  it("mengirim Idempotency-Key bila diberikan", async () => {
    client.setTokens("access", "refresh");
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: "job-1" }));

    await client.post("/api/v1/jobs/subject-report", undefined, { idempotencyKey: "key-123" });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toBe("key-123");
  });

  it("mengembalikan undefined untuk 204", async () => {
    client.setTokens("access", "refresh");
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(client.post("/api/v1/auth/logout")).resolves.toBeUndefined();
  });
});
