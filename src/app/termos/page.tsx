import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { TERMS_VERSION } from "@/modules/leads/status";

export const metadata = {
  title: "Termos de Participação | PROVISION — Imersão Sem Fronteiras",
  description: "O que a PROVISION — Imersão Sem Fronteiras | Paraguai 2026 inclui, o que não inclui e como funciona a contratação.",
  alternates: { canonical: "/termos" },
};

/** Summarises the participation contracts (Lote 01, 02, 03 and VIP). The signed contract prevails. */
export default function TermosPage() {
  return (
    <LegalPage
      kicker="Termos de Participação"
      title="O que você está contratando"
      version={TERMS_VERSION}
      pending={["Legislação aplicável e foro, que o próprio contrato prevê validar antes da assinatura definitiva."]}
    >
      <LegalSection title="A experiência">
        <p>PROVISION — Imersão Sem Fronteiras | Paraguai 2026: imersão executiva em Asunción, de 16 a 21 de novembro de 2026, com hospedagem no Crowne Plaza Asunción. Chegada no dia 16, programação executiva de 17 a 20 e retorno no dia 21.</p>
        <p>Cada edição reúne no máximo 20 empresas brasileiras, com até 3 representantes por empresa.</p>
      </LegalSection>
      <LegalSection title="O que está incluído">
        <ul className="list-disc space-y-1 pl-5">
          <li>5 noites no Crowne Plaza Asunción, em apartamento individual.</li>
          <li>Alimentação conforme a programação oficial: almoços, jantares, coffee breaks e happy hour de boas-vindas.</li>
          <li>Traslados aeroporto–hotel–aeroporto e deslocamentos da programação.</li>
          <li>Agenda institucional de 18/11, quatro visitas técnicas em 19/11 e Business Day com networking e rodadas B2B em 20/11.</li>
          <li>Kit e credencial do participante, tradução assistida por IA e acompanhamento operacional durante a imersão.</li>
        </ul>
      </LegalSection>
      <LegalSection title="O que não está incluído">
        <ul className="list-disc space-y-1 pl-5">
          <li>Passagens aéreas e seguro-viagem.</li>
          <li>Despesas médicas e medicamentos.</li>
          <li>Acompanhantes e representantes além de 3 por empresa.</li>
          <li>Despesas pessoais e consumo fora da programação.</li>
          <li>Serviços adicionais, como documentação, implantação ou contratação, cotados à parte.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Investimento">
        <p>Lote 01: R$ 19.997 até 07/10/2026. Lote 02: R$ 22.997 de 08 a 13/10/2026. Lote 03: R$ 25.997 de 14 a 21/10/2026. VIP: R$ 29.997 até 26/10/2026. A experiência-base é a mesma em todos os lotes; muda só a condição comercial conforme a data.</p>
        <p>O VIP inclui, além da experiência executiva: 1 sessão estratégica individual remota de até 60 minutos antes da imersão, 1 sessão individual de até 90 minutos durante a imersão e, por 30 dias corridos depois, 2 sessões individuais de até 60 minutos, suporte assíncrono com até 6 solicitações objetivas e material digital de continuidade. O suporte VIP tem escopo e período definidos e não representa consultoria ilimitada.</p>
      </LegalSection>
      <LegalSection title="Responsabilidades e limites">
        <p>Documentos de viagem e exigências migratórias são responsabilidade do participante.</p>
        <p>A PROVISION estrutura acesso, contexto, conexões e oportunidades de interação. Não garante negócios, retorno financeiro, aprovação de investimentos ou concessão de documentos.</p>
      </LegalSection>
      <LegalSection title="Como funciona a contratação">
        <p>Você conversa com um consultor e, quando decide fechar, ele envia o contrato da sua condição comercial. Você lê, assina e só então paga. Este resumo não substitui o contrato: o documento assinado é o que vale.</p>
      </LegalSection>
      <LegalSection title="Pagamento e confirmação">
        <p>A pré-reserva é de R$ 3.500,00 e é abatida do valor total; não é cobrança adicional. O saldo é pago até o vencimento indicado no contrato. A participação é confirmada com o pagamento integral e a confirmação financeira; o envio de comprovante, sozinho, não quita.</p>
        <p>Meios: PIX, transferência bancária, cartão de crédito, link de pagamento ou plataforma eletrônica, sempre pelos canais oficiais informados pela organização.</p>
        <p>Se o saldo não for pago no prazo, a vaga pode ser liberada para outro participante e a pré-reserva não é devolvida automaticamente, respeitados os direitos previstos em lei.</p>
      </LegalSection>
      <LegalSection title="Se você não puder comparecer">
        <p>Depois do pagamento integral, você pode pedir por escrito, antes do início do evento (de preferência com 10 dias corridos de antecedência), a conversão do valor pago em crédito para a próxima edição, conforme disponibilidade. O crédito não é convertido em dinheiro automaticamente, não garante o mesmo preço, datas ou programação, e uma edição de valor maior exige o pagamento da diferença.</p>
        <p>Não comparecer sem aviso não é cancelamento automático e não gera restituição automática.</p>
      </LegalSection>
      <LegalSection title="Cancelamento, substituição e força maior">
        <p>O cancelamento é pedido formalmente e analisado conforme o momento da solicitação, os valores pagos, os serviços já contratados, os custos não recuperáveis, o contrato e a legislação. Direitos garantidos em lei são preservados.</p>
        <p>A empresa pode pedir a substituição do representante antes do evento, conforme a viabilidade operacional e documental; eventuais custos da alteração ficam com a contratante.</p>
        <p>Eventos externos imprevisíveis, como clima severo, restrições governamentais, interrupções de transporte, greves ou falhas de infraestrutura, podem exigir ajustes operacionais. A organização busca preservar a finalidade da experiência.</p>
      </LegalSection>
    </LegalPage>
  );
}
