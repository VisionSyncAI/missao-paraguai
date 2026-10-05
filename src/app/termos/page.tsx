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
    >
      <LegalSection title="A experiência">
        <p>PROVISION — Imersão Sem Fronteiras | Paraguai 2026: imersão executiva em Asunción, de 16 a 21 de novembro de 2026, com hospedagem no Crowne Plaza Asunción. Chegada no dia 16, programação executiva de 17 a 20 e retorno no dia 21.</p>
        <p>Participação individual. Experiência empresarial. Cada edição reúne no máximo 20 empresas brasileiras, com até 3 executivos por empresa. O investimento é por participante. Empresas podem participar com mais de um executivo na mesma edição. Após o cadastro, o consultor entra em contato para entender o perfil dos participantes, os objetivos da empresa e orientar os próximos passos.</p>
      </LegalSection>
      <LegalSection title="O que está incluído">
        <ul className="list-disc space-y-1 pl-5">
          <li>5 noites no Crowne Plaza Asunción, em 1 apartamento individual por participante.</li>
          <li>Depois da imersão, uma reunião de acompanhamento com o consultor para esclarecer dúvidas e organizar os próximos passos. Com mais de um executivo da mesma empresa, essa reunião pode ser conjunta.</li>
          <li>Alimentação conforme a programação oficial: almoços, jantares, coffee breaks e happy hour de boas-vindas.</li>
          <li>Traslados aeroporto–hotel–aeroporto e deslocamentos da programação.</li>
          <li>Agenda institucional de 18/11, quatro visitas técnicas em 19/11 e Business Day com networking e rodadas B2B em 20/11.</li>
          <li>Kit e credencial do participante, tradução assistida por IA e acompanhamento operacional durante a imersão.</li>
        </ul>
      </LegalSection>
      <LegalSection title="O que não está incluído">
        <ul className="list-disc space-y-1 pl-5">
          <li>Passagem aérea não incluída. Seguro-viagem também não.</li>
          <li>Despesas médicas e medicamentos.</li>
          <li>Representante além de 3 por empresa.</li>
          <li>Despesas pessoais e consumo fora da programação.</li>
          <li>Serviços adicionais, como documentação, implantação ou contratação, cotados à parte.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Investimento">
        <p>O investimento é por participante. A empresa pode inscrever até 3 executivos, e o consultor apresenta o valor total. Lote 01: R$ 19.997 até 07/10/2026, saldo R$ 16.497. Lote 02: R$ 22.997 de 08 a 13/10/2026, saldo R$ 19.497. Lote 03: R$ 25.997 de 14 a 21/10/2026, saldo R$ 22.497. VIP: R$ 29.997 até 26/10/2026, saldo R$ 26.497. A pré-reserva de R$ 3.500,00 é abatida do total de cada participante. Condições de pagamento apresentadas pelo consultor durante a confirmação da participação. A experiência-base é a mesma nos três lotes; muda a data. O VIP acrescenta o escopo abaixo, não um quarto lote.</p>
        <p>O VIP inclui, além da experiência executiva: 1 sessão estratégica individual remota de até 60 minutos antes da imersão, 1 sessão individual de até 90 minutos durante a imersão e, por 30 dias corridos depois, 2 sessões individuais de até 60 minutos, suporte assíncrono com até 6 solicitações objetivas e material digital de continuidade. O suporte VIP tem escopo e período definidos e não representa consultoria ilimitada.</p>
      </LegalSection>
      <LegalSection title="Responsabilidades e limites">
        <p>Documentos de viagem e exigências migratórias são responsabilidade do participante.</p>
        <p>A PROVISION estrutura acesso, contexto, conexões e oportunidades de interação. Não garante negócios, retorno financeiro, aprovação de investimentos ou concessão de documentos.</p>
      </LegalSection>
      <LegalSection title="Como funciona a contratação">
        <p>Você conversa com um consultor. Quando decide participar, ele apresenta as condições de pagamento e envia o contrato. Você lê, assina e só então paga. Este resumo é a oferta publicada no site. O documento que o consultor envia é o que você assina.</p>
      </LegalSection>
      <LegalSection title="Pagamento e confirmação">
        <p>A pré-reserva é de R$ 3.500,00 e é abatida do valor total; não é cobrança adicional. Condições de pagamento apresentadas pelo consultor durante a confirmação da participação. A participação é confirmada com o pagamento integral e a confirmação financeira; o envio de comprovante, sozinho, não quita.</p>
        <p>Meios: PIX, transferência bancária, cartão de crédito, link de pagamento ou plataforma eletrônica, sempre pelos canais oficiais informados pela organização.</p>
        <p>A vaga se confirma com o pagamento integral. O consultor explica, na confirmação, o que acontece se o saldo não for pago.</p>
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
