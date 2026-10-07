import { test, expect, newUser, registerViaUi } from "./fixtures";

test.describe("REST API", () => {
  test("health check reports the database is up", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ status: "ok", db: "ok" });
  });

  test("lead endpoints require authentication", async ({ request }) => {
    expect((await request.get("/api/leads")).status()).toBe(401);
    expect((await request.post("/api/leads", { data: { name: "x", email: "x@x.io" } })).status()).toBe(401);
  });

  test("full CRUD + analyze flow over the API", async ({ page, user }) => {
    void user;
    const api = page.request; // shares the signed-in session cookie

    const created = await api.post("/api/leads", {
      data: { name: "API Lead", email: "api@example.com", message: "Need pricing and a quote, budget approved, urgent." },
    });
    expect(created.status()).toBe(201);
    const { lead } = await created.json();
    expect(lead).toMatchObject({ name: "API Lead", status: "NEW", source: "api" });

    const list = await (await api.get("/api/leads")).json();
    expect(list.leads.map((l: { id: string }) => l.id)).toContain(lead.id);

    const patched = await api.patch(`/api/leads/${lead.id}`, { data: { status: "CONTACTED" } });
    expect(patched.status()).toBe(200);
    expect((await patched.json()).lead.status).toBe("CONTACTED");

    const analyzed = await api.post(`/api/leads/${lead.id}/analyze`);
    expect(analyzed.status()).toBe(200);
    expect((await analyzed.json()).lead).toMatchObject({ aiTemperature: "HOT", aiModel: "mock-analyzer" });

    expect((await api.delete(`/api/leads/${lead.id}`)).status()).toBe(204);
    expect((await api.get(`/api/leads/${lead.id}`)).status()).toBe(404);
  });

  test("invalid payloads are rejected with field errors", async ({ page, user }) => {
    void user;
    const res = await page.request.post("/api/leads", { data: { name: "", email: "nope" } });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
    expect(body.details).toHaveProperty("email");

    const notJson = await page.request.post("/api/leads", { data: "plain text", headers: { "content-type": "text/plain" } });
    expect(notJson.status()).toBe(400);
  });

  test("users cannot read, edit or delete each other's leads", async ({ page, browser }) => {
    await registerViaUi(page, newUser());
    const { lead } = await (await page.request.post("/api/leads", { data: { name: "Mine", email: "mine@example.com" } })).json();

    const other = await browser.newContext();
    const otherPage = await other.newPage();
    await registerViaUi(otherPage, newUser());
    const api = otherPage.request;

    expect((await api.get(`/api/leads/${lead.id}`)).status()).toBe(404);
    expect((await api.patch(`/api/leads/${lead.id}`, { data: { name: "Hacked" } })).status()).toBe(404);
    expect((await api.delete(`/api/leads/${lead.id}`)).status()).toBe(404);
    expect((await (await api.get("/api/leads")).json()).leads).toEqual([]);
    await other.close();

    // Owner still sees the untouched lead.
    expect((await (await page.request.get(`/api/leads/${lead.id}`)).json()).lead.name).toBe("Mine");
  });
});

test("PATCH only changes the fields that were sent", async ({ page, user }) => {
  void user;
  const { lead } = await (
    await page.request.post("/api/leads", {
      data: { name: "Partial", email: "p@example.com", company: "Keep Co", message: "Keep this message", notes: "Keep notes" },
    })
  ).json();

  const res = await page.request.patch(`/api/leads/${lead.id}`, { data: { status: "WON" } });
  expect((await res.json()).lead).toMatchObject({
    status: "WON",
    company: "Keep Co",
    message: "Keep this message",
    notes: "Keep notes",
  });
});
