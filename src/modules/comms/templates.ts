import { isLiveMeetingLink } from "@/lib/meetingLink";
import { formatSaoPaulo } from "@/lib/timezone";

function appUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

export const EmailCopy = {
  meetingConfirmed(name: string, consultant: string, when: Date, meetingUrl?: string | null) {
    const live = isLiveMeetingLink(meetingUrl);
    return {
      subject: "Imersão Paraguai — reunião confirmada",
      body: [
        `Olá, ${name}.`,
        "",
        "Seu horário para conversar sobre a Imersão Paraguai foi confirmado.",
        "",
        `Consultor: ${consultant}`,
        `Data e horário: ${formatSaoPaulo(when)}`,
        "",
        live
          ? `Entrar na reunião:\n${meetingUrl}`
          : "O link da reunião será enviado para o e-mail informado.",
        "",
        "Se não encontrar o e-mail, verifique sua caixa de spam ou lixo eletrônico.",
        "",
        "Imersão Paraguai — Vision Cybero AI × Proceit",
      ].join("\n"),
    };
  },
  leadReceived(name: string, consultant: string, when: Date, meetingUrl: string, token?: string) {
    return {
      subject: "Pré-inscrição recebida — Imersão Paraguai",
      body: [
        `Olá, ${name}.`,
        "",
        "Recebemos seu interesse na Imersão Paraguai.",
        `Sua conversa com ${consultant} está agendada para ${formatSaoPaulo(when)}.`,
        isLiveMeetingLink(meetingUrl)
          ? `Sala da reunião: ${meetingUrl}`
          : "O link da reunião será enviado neste e-mail assim que a sala estiver disponível. Confira também a caixa de spam.",
        token ? `Confirmação e apresentação: ${appUrl()}/interesse/confirmacao?t=${token}` : "",
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
        isLiveMeetingLink(meetingUrl) ? `Entrar na reunião:\n${meetingUrl}` : "",
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
