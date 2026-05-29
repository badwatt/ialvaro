import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const { token } = (await request.json()) as { token: string };
  const url = `${import.meta.env.PUBLIC_CAP_URL}/${import.meta.env.PUBLIC_CAP_SITE_KEY}/siteverify`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: import.meta.env.CAP_SECRET,
      response: token,
    }),
  });
  const data = (await res.json()) as { success: boolean };
  if (!data.success) {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
