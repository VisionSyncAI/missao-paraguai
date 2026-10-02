// Next.js calls register() once per server process at boot. The import must sit inside the
// NEXT_RUNTIME check so the Edge bundle drops the Node-only outbox code.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startOutboxWorker } = await import("@/modules/comms/outboxWorker");
    startOutboxWorker();
  }
}
