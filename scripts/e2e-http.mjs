const base = "http://localhost:3000";
const email = `e2e.${Date.now()}@empresa.com`;
const leadBody = {
  fullName: "Carlos Mendes E2E",
  email,
  whatsapp: "11977776666",
  jobTitle: "Diretor(a) / C-Level",
  jobTitleOther: "",
  companySize: "R$ 5 milhões – R$ 20 milhões",
  interests: ["Expandir minha empresa"],
  objective: "",
  relationship: "Ainda não",
  intent: "Quero conversar com um consultor",
  consent: true,
  source: "e2e",
};

function cookieJar(setCookie) {
  const jar = new Map();
  for (const line of setCookie) {
    const part = line.split(";")[0];
    const i = part.indexOf("=");
    if (i > 0) jar.set(part.slice(0, i), part.slice(i + 1));
  }
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function req(path, opts = {}) {
  const res = await fetch(`${base}${path}`, { redirect: "manual", ...opts });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* html */
  }
  return { status: res.status, json, text, cookies: res.headers.getSetCookie?.() || [] };
}

const home = await req("/");
const interesse = await req("/interesse");
const site = await req("/site.html");
const hasCta = site.text.includes("Quero participar") && site.text.includes("/interesse");
const start = interesse.text.includes("Começar minha pré-inscrição") || interesse.text.includes("pr");

const created = await req("/api/leads", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(leadBody),
});
const leadCookie = cookieJar(created.cookies);

const resubmit = await req("/api/leads", {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: leadCookie },
  body: JSON.stringify(leadBody),
});

const avail = await req("/api/meetings/availability");
const slot = avail.json?.slots?.[0];
let meeting = { status: 0, json: null };
if (slot) {
  meeting = await req("/api/leads/meeting", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: leadCookie },
    body: JSON.stringify({ scheduledAt: slot.start, consultantId: slot.consultantId }),
  });
}

const denyAdmin = await req("/admin/leads");
const denyApi = await req("/api/admin/leads", { headers: { Cookie: "ip_staff=random.cookie" } });
const denyPart = await req("/participante");

const adminEmail = process.env.ADMIN_EMAIL || "";
const adminPassword = process.env.ADMIN_PASSWORD || "";
let login = { status: 0, json: null };
let leads = { status: 0, json: null };
if (adminEmail && adminPassword) {
  login = await req("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const staffCookie = cookieJar(login.cookies);
  leads = await req("/api/admin/leads", { headers: { Cookie: staffCookie } });
}

const found = Boolean(leads.json?.leads?.some((l) => l.email === email));

console.log(
  JSON.stringify({
    home: home.status,
    interesse: interesse.status,
    landingCta: hasCta,
    formHint: Boolean(start),
    leadCreate: created.status,
    leadCreatedFlag: created.json?.created,
    tokenPreservedResubmit: resubmit.json?.tokenPreserved,
    availability: avail.status,
    availabilityProvider: avail.json?.provider,
    meeting: meeting.status,
    meetingOk: meeting.json?.ok === true,
    meetingUrlOfficial: meeting.json?.meeting?.meetingUrl ?? null,
    meetingJoinSuppressed: !meeting.json?.meeting?.meetingUrl,
    emailStatus: meeting.json?.email?.status ?? meeting.json?.meeting?.emailStatus ?? null,
    adminDenied: denyAdmin.status,
    apiDenied: denyApi.status,
    participantDenied: denyPart.status,
    login: login.status,
    adminLeads: leads.status,
    leadVisibleInCrm: found,
  }),
);
process.exit(created.status === 200 && denyApi.status === 401 ? 0 : 1);
