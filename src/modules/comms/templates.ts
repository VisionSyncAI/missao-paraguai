import { formatSaoPaulo } from "@/lib/timezone";

function appUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

export const EmailCopy = {
  leadReceived(name: string, consultant: string, when: Date, meetingUrl: string, token: string) {
    return {
      subject: "Pré-inscrição recebida — Imersão Paraguai",
      body: [
        `Olá, ${name}.`,
        "",
        "Recebemos seu interesse na Imersão Paraguai.",
        `Sua conversa com ${consultant} está agendada para ${formatSaoPaulo(when)}.`,
        `Sala da reunião: ${meetingUrl}`,
        `Confirmação e apresentação: ${appUrl()}/interesse/confirmacao?t=${token}`,
        "",
        "Imersão Paraguai — Vision Cybero AI × Proceit",
      ].join("\n"),
    };
  },
  meetingUpdated(name: string, status: string, when: Date | null, meetingUrl: string) {
    return {
      subject: `Reunião ${status.toLowerCase()} — Imersão Paraguai`,
      body: [
        `Olá, ${name}.`,
        "",
        `Atualização da reunião comercial: ${status}.`,
        when ? `Horário: ${formatSaoPaulo(when)}` : "",
        meetingUrl ? `Sala: ${meetingUrl}` : "",
      ].join("\n"),
    };
  },
  registrationCreated(name: string, token: string) {
    return {
      subject: "Ficha de inscrição aberta — Imersão Paraguai",
      body: [
        `Olá, ${name}.`,
        "",
        "Sua proposta foi aceita. Complete a ficha de inscrição.",
        `${appUrl()}/login?t=${token}`,
      ].join("\n"),
    };
  },
  paymentApproved(name: string, token: string) {
    return {
      subject: "Pagamento confirmado — Imersão Paraguai",
      body: [
        `Olá, ${name}.`,
        "",
        "Recebemos a confirmação do gateway. Sua inscrição está confirmada.",
        `Área do participante: ${appUrl()}/login?t=${token}`,
      ].join("\n"),
    };
  },
  paymentFailed(name: string) {
    return {
      subject: "Pagamento não confirmado — Imersão Paraguai",
      body: [`Olá, ${name}.`, "", "O gateway não confirmou o pagamento. Fale com o consultor para uma nova tentativa."].join("\n"),
    };
  },
  documentPending(name: string, token: string) {
    return {
      subject: "Documentos pendentes — Imersão Paraguai",
      body: [`Olá, ${name}.`, "", `Envie os documentos na área do participante: ${appUrl()}/login?t=${token}`].join("\n"),
    };
  },
};
