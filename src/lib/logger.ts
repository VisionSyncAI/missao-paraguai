type LogFields = Record<string, unknown>;

export function logInfo(message: string, fields: LogFields = {}) {
  console.info(JSON.stringify({ level: "info", message, ...sanitize(fields), ts: new Date().toISOString() }));
}

export function logError(message: string, fields: LogFields = {}) {
  console.error(JSON.stringify({ level: "error", message, ...sanitize(fields), ts: new Date().toISOString() }));
}

function sanitize(fields: LogFields) {
  const blocked = ["cpf", "password", "token", "dietaryNotes", "accessToken"];
  const out: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (blocked.some((b) => key.toLowerCase().includes(b))) continue;
    out[key] = value;
  }
  return out;
}
