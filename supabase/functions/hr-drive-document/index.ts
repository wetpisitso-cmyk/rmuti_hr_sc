import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const allowedOrigins = new Set([
  "https://wetpisitso-cmyk.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
]);
const maxBytes = 5 * 1024 * 1024;
function headers(origin: string) {
  const cors = allowedOrigins.has(origin)
    ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
    : {};
  return {
    ...cors,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
  };
}
function json(body: object, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers(origin), "Content-Type": "application/json; charset=utf-8" },
  });
}
function base64url(bytes: Uint8Array) {
  let str = "";
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function encodeJson(value: object) {
  return base64url(new TextEncoder().encode(JSON.stringify(value)));
}
async function googleAccessToken() {
  const email = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const pem = Deno.env.get("GOOGLE_PRIVATE_KEY")?.replace(/\\n/g, "\n");
  if (!email || !pem) throw Error("Google Drive credentials not configured");
  const payload = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const binary = atob(payload);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    Uint8Array.from(binary, (ch) => ch.charCodeAt(0)),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const now = Math.floor(Date.now() / 1000);
  const assertion = [
    encodeJson({ alg: "RS256", typ: "JWT" }),
    encodeJson({
      iss: email,
      scope: "https://www.googleapis.com/auth/drive",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  ].join(".");
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(assertion),
  );
  const signedJwt = assertion + "." + base64url(new Uint8Array(signature));
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt,
    }),
  });
  if (!response.ok) throw Error("Google token request failed");
  const result = await response.json();
  if (!result.access_token) throw Error("Google access token missing");
  return String(result.access_token);
}
async function removeOrphan(id: string, token: string) {
  try {
    await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(id), {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
  } catch { /* Cleanup is best effort, review Drive for orphans. */ }
}
async function uploadPdf(file: File, requestId: string, token: string) {
  const folder = Deno.env.get("HR_DRIVE_FOLDER_ID");
  if (!folder) throw Error("HR_DRIVE_FOLDER_ID not configured");
  const init = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": "application/pdf",
      "X-Upload-Content-Length": String(file.size),
    },
    body: JSON.stringify({
      name: `${requestId}-${crypto.randomUUID()}.pdf`,
      mimeType: "application/pdf",
      parents: [folder],
    }),
  });
  const location = init.headers.get("Location");
  if (!init.ok || !location || !new URL(location).hostname.endsWith("googleapis.com"))
    throw Error("Could not begin Google Drive upload");
  const uploaded = await fetch(location, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/pdf" },
    body: await file.arrayBuffer(),
  });
  if (!uploaded.ok) throw Error("Google Drive upload failed");
  const result = await uploaded.json();
  if (!result.id || !/^[A-Za-z0-9_-]{10,200}$/.test(result.id))
    throw Error("Invalid Google Drive file reference");
  return String(result.id);
}
Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") ?? "";
  if (req.method === "OPTIONS") {
    return allowedOrigins.has(origin)
      ? new Response(null, { status: 204, headers: headers(origin) })
      : json({ error: "Origin not allowed" }, 403, origin);
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  if (origin && !allowedOrigins.has(origin)) return json({ error: "Origin not allowed" }, 403, origin);
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Server configuration incomplete" }, 503, origin);
  const match = /^Bearer\s+(.+)$/i.exec(req.headers.get("Authorization") ?? "");
  if (!match) return json({ error: "กรุณาเข้าสู่ระบบ" }, 401, origin);
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authError } = await admin.auth.getUser(match[1]);
  if (authError || !user) return json({ error: "สิทธิ์เข้าสู่ระบบไม่ถูกต้อง" }, 401, origin);
  // Domain and email confirmation are server-side conditions, not a browser-only check.
  if (!user.email_confirmed_at ||
      !/^[^\\s@]+@rmuti\\.ac\\.th$/i.test((user.email ?? "").trim()) ||
      user.is_anonymous === true) {
    return json({ error: "กรุณายืนยันอีเมลมหาวิทยาลัยก่อนใช้เอกสาร" }, 403, origin);
  }
  const { data: member, error: memberError } = await admin.from("hr_members")
    .select("role").eq("id", user.id).maybeSingle();
  if (memberError || !member) return json({ error: "บัญชีนี้ยังไม่ได้รับสิทธิ์ใช้งาน" }, 403, origin);
  try {
    let action = "", requestId = "", note = "", previous = "", file: File | null = null;
    if ((req.headers.get("Content-Type") ?? "").includes("multipart/form-data")) {
      const data = await req.formData();
      action = String(data.get("action") ?? "");
      requestId = String(data.get("request_id") ?? "");
      note = String(data.get("note") ?? "");
      previous = String(data.get("previous") ?? "");
      const candidate = data.get("file");
      file = candidate instanceof File ? candidate : null;
    } else {
      const data = await req.json();
      action = String(data.action ?? "");
      requestId = String(data.request_id ?? "");
    }
    if (!/^[0-9a-f-]{36}$/i.test(requestId)) return json({ error: "รหัสคำขอไม่ถูกต้อง" }, 400, origin);
    const { data: record, error: readError } = await admin.from("hr_requests")
      .select("id,owner_id,status,document_path").eq("id", requestId).maybeSingle();
    if (readError || !record) return json({ error: "ไม่พบคำขอ" }, 404, origin);
    if (action === "upload") {
      if (!["hr","admin"].includes(member.role)) return json({ error: "เฉพาะเจ้าหน้าที่ HR" }, 403, origin);
      if (record.status !== "review" || previous !== "review")
        return json({ error: "สถานะคำขอเปลี่ยนแล้ว กรุณาโหลดใหม่" }, 409, origin);
      if (!note.trim() || note.length > 600)
        return json({ error: "กรุณาระบุข้อมูลการรับเอกสาร" }, 400, origin);
      if (!file || file.size <= 0 || file.size > maxBytes ||
        (await file.slice(0, 5).text()) !== "%PDF-")
        return json({ error: "กรุณาเลือก PDF ขนาดไม่เกิน 5 MB" }, 400, origin);
      const token = await googleAccessToken();
      const id = await uploadPdf(file, requestId, token);
      const changed = await admin.from("hr_requests")
        .update({ status: "ready", note, document_path: "drive:" + id })
        .eq("id", requestId).eq("status", "review").select("id").maybeSingle();
      if (changed.error || !changed.data) {
        await removeOrphan(id, token);
        return json({ error: "ไม่สามารถบันทึกสถานะคำขอ กรุณาโหลดใหม่" }, 409, origin);
      }
      return json({ success: true, file_id: id }, 200, origin);
    }
    if (action === "download") {
      if (!["hr","admin"].includes(member.role) && record.owner_id !== user.id)
        return json({ error: "ไม่มีสิทธิ์อ่านเอกสาร" }, 403, origin);
      if (!["ready", "done"].includes(record.status) ||
        !/^drive:[A-Za-z0-9_-]{10,200}$/.test(record.document_path ?? ""))
        return json({ error: "เอกสารยังไม่พร้อมรับ" }, 409, origin);
      const token = await googleAccessToken();
      const id = record.document_path.slice(6);
      const dl = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(id) + "?alt=media", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!dl.ok) throw Error("Drive download failed");
      return new Response(dl.body, {
        status: 200,
        headers: {
          ...headers(origin),
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="certificate.pdf"',
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    return json({ error: "ไม่รองรับการทำรายการนี้" }, 400, origin);
  } catch (error) {
    console.error("hr-drive-document:", error instanceof Error ? error.message : error);
    return json({ error: "บริการ Google Drive ยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ" }, 503, origin);
  }
});
