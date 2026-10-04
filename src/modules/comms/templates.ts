import { isLiveMeetingLink } from "@/lib/meetingLink";
import { formatSaoPaulo } from "@/lib/timezone";
import { WHATSAPP_URL } from "@/data/site";

function appUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

export const EmailCopy = {
  meetingConfirmed(name: string, consultant: string, when: Date, meetingUrl?: string | null) {
    const live = isLiveMeetingLink(meetingUrl);
    return {
      subject: "PROVISION Paraguai 2026 — reunião confirmada",
      body: [
        `Olá, ${name}.`,
        "",
        "Seu horário para conversar sobre a PROVISION Paraguai 2026 foi confirmado.",
        "",
        `Consultor: ${consultant}`,
        `Data e horário: ${formatSaoPaulo(when)}`,
        "",
        live
          ? `Entrar na reunião:\n${meetingUrl}`
          : "O consultor vai chamar você pelo WhatsApp informado no horário marcado.",
        "",
        `Se preferir, fale direto com a equipe no WhatsApp: ${WHATSAPP_URL}`,
        "",
        "PROVISION · Imersão Sem Fronteiras — Vision Cybero AI × PROCEIT",
      ].join("\n"),
    };
  },
  leadReceived(name: string, consultant: string, when: Date, meetingUrl: string, token?: string) {
    return {
      subject: "Pré-inscrição recebida — PROVISION Paraguai 2026",
      body: [
        `Olá, ${name}.`,
        "",
        "Recebemos seu interesse na PROVISION Paraguai 2026.",
        `Sua conversa com ${consultant} está agendada para ${formatSaoPaulo(when)}.`,
        isLiveMeetingLink(meetingUrl)
          ? `Sala da reunião: ${meetingUrl}`
          : "O consultor vai chamar você pelo WhatsApp informado no horário marcado.",
        token ? `Confirmação e apresentação: ${appUrl()}/interesse/confirmacao?t=${token}` : "",
        "",
        "PROVISION · Imersão Sem Fronteiras — Vision Cybero AI × PROCEIT",
      ].join("\n"),
    };
  },
  meetingUpdated(name: string, status: string, when: Date | null, meetingUrl: string) {
    return {
      subject: `Reunião ${status.toLowerCase()} — PROVISION Paraguai 2026`,
      body: [
        `Olá, ${name}.`,
        "",
        `Atualização da reunião comercial: ${status}.`,
        when ? `Horário: ${formatSaoPaulo(when)}` : "",
        isLiveMeetingLink(meetingUrl) ? `Entrar na reunião:\n${meetingUrl}` : "",
      ].join("\n"),
    };
  },
  leadResubmitted(name: string, verifyToken: string) {
    return {
      subject: "Confirme sua pré-inscrição — PROVISION Paraguai 2026",
      body: [
        `Olá, ${name}.`,
        "",
        "Recebemos uma nova pré-inscrição usando este e-mail.",
        "Se foi você, confirme pelo link abaixo para continuar e agendar sua conversa (válido por 24 horas):",
        `${appUrl()}/api/leads/verify?t=${encodeURIComponent(verifyToken)}`,
        "",
        "Se não foi você, ignore esta mensagem. Nenhum dado da sua pré-inscrição foi alterado.",
      ].join("\n"),
    };
  },
  registrationCreated(name: string, token: string) {
    return {
      subject: "Ficha de inscrição aberta — PROVISION Paraguai 2026",
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
      subject: "Pagamento confirmado — PROVISION Paraguai 2026",
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
      subject: "Pagamento não confirmado — PROVISION Paraguai 2026",
      body: [`Olá, ${name}.`, "", "O gateway não confirmou o pagamento. Fale com o consultor para uma nova tentativa."].join("\n"),
    };
  },
  documentPending(name: string, token: string) {
    return {
      subject: "Documentos pendentes — PROVISION Paraguai 2026",
      body: [`Olá, ${name}.`, "", `Envie os documentos na área do participante: ${appUrl()}/login?t=${token}`].join("\n"),
    };
  },
};
