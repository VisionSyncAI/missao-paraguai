import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { PRIVACY_VERSION } from "@/modules/leads/status";

export const metadata = {
  title: "Política de Privacidade | PROVISION — Imersão Sem Fronteiras",
  description: "Como a PROVISION trata os dados enviados pelo site missaoparaguai.com.",
  alternates: { canonical: "/privacidade" },
};

const List = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-1 pl-5">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

/** Organization's privacy text; technical sections describe what the site actually does
 *  (captureInterest, leadSession cookie, localStorage keys, hashed IP on consent, anonymous funnel events). */
export default function PrivacidadePage() {
  return (
    <LegalPage
      kicker="Política de Privacidade"
      title="Política de Privacidade"
      version={PRIVACY_VERSION}
      pending={[
        "Razão social completa das partes responsáveis, CNPJ da entidade brasileira e dados cadastrais da organização paraguaia.",
        "Definição de controlador e operador e eventual controladoria conjunta.",
        "Encarregado pelo tratamento de dados ou hipótese de dispensa aplicável.",
        "Canal oficial de privacidade por e-mail.",
        "Bases legais definitivas por finalidade.",
        "Prazos de retenção por categoria de dado.",
        "Fornecedores que recebem dados.",
        "Eventual transferência internacional e mecanismos aplicáveis.",
        "Regras de atendimento aos titulares e procedimentos de segurança.",
        "Demais requisitos jurídicos específicos da operação Brasil–Paraguai.",
      ]}
    >
      <p>
        A PROVISION — Imersão Sem Fronteiras valoriza a privacidade e a proteção dos dados pessoais tratados em seus canais digitais. Esta
        Política explica quais dados podem ser coletados, para quais finalidades são utilizados, com quem podem ser compartilhados, como são
        protegidos e quais direitos podem ser exercidos pelo titular.
      </p>
      <p>
        O tratamento de dados pessoais no contexto da PROVISION observa a legislação aplicável, especialmente a Lei nº 13.709/2018 — Lei Geral
        de Proteção de Dados Pessoais (LGPD).
      </p>

      <LegalSection title="1. Quem é responsável pelo tratamento">
        <p>A PROVISION é uma iniciativa realizada pela PROCEIT, organizadora no Paraguai, e pela Vision Cybero AI, organizadora no Brasil.</p>
        <p>
          A definição formal de controlador(es), operador(es), responsabilidades entre as partes e demais papéis no tratamento de dados será
          estabelecida conforme a estrutura jurídica e operacional aplicável à iniciativa. Os dados cadastrais da organização e o encarregado
          pelo tratamento de dados serão informados nesta página após a validação jurídica.
        </p>
      </LegalSection>

      <LegalSection title="2. Quais dados podemos coletar">
        <p>Dependendo da interação com o site, podemos tratar dados fornecidos diretamente pelo interessado, incluindo:</p>
        <List
          items={[
            "nome;",
            "empresa;",
            "cargo;",
            "telefone ou WhatsApp;",
            "endereço de e-mail;",
            "objetivo ou interesse informado no formulário;",
            "informações do diagnóstico empresarial;",
            "origem do contato;",
            "parâmetros de campanha (UTM);",
            "registros de aceite da Política de Privacidade e dos Termos, com a versão dos documentos aceitos;",
            "registro do download da apresentação executiva.",
          ]}
        />
        <p>
          Também registramos dados técnicos necessários ao funcionamento e à segurança do site. No momento do aceite, guardamos uma impressão
          cifrada do endereço IP (não o IP em si) e a identificação do navegador. O endereço IP também é usado de forma transitória para
          limitar o número de envios e evitar abusos. Eventos de uso do site, como etapas do formulário concluídas, são registrados sem
          identificação pessoal.
        </p>
        <p>Não solicitamos, pelo formulário de interesse, dados pessoais sensíveis como condição para envio da manifestação de interesse.</p>
        <p>
          Caso informações adicionais sejam necessárias para a participação na experiência, elas poderão ser solicitadas durante o processo de
          contratação e preparação, conforme a finalidade específica e a necessidade operacional.
        </p>
      </LegalSection>

      <LegalSection title="3. Para que utilizamos os dados">
        <p><b>3.1. Atendimento ao interesse demonstrado.</b> Receber a manifestação de interesse, compreender o objetivo informado, realizar contato, direcionar o atendimento a um consultor, realizar a conversa comercial e apresentar informações sobre a PROVISION.</p>
        <p><b>3.2. Processo de contratação.</b> Quando o interessado decidir avançar, os dados poderão ser utilizados para procedimentos preliminares relacionados à contratação e, posteriormente, para a execução do contrato.</p>
        <p><b>3.3. Comunicação.</b> Envio de comunicações relacionadas ao atendimento, à apresentação, ao processo de contratação, à programação, à preparação da experiência e a informações operacionais da participação.</p>
        <p><b>3.4. Operação da experiência.</b> Quando houver contratação, determinados dados poderão ser necessários para credenciamento, hospedagem, transporte, alimentação, comunicação, segurança, organização operacional e execução das atividades contratadas. O contrato da PROVISION também prevê o tratamento de dados necessário à contratação e à execução da experiência, incluindo compartilhamento com fornecedores diretamente envolvidos na operação.</p>
      </LegalSection>

      <LegalSection title="4. Bases legais">
        <p>O tratamento é realizado conforme a finalidade e a hipótese legal aplicável. Entre as hipóteses que poderão fundamentar o tratamento estão:</p>
        <List
          items={[
            "execução de contrato ou de procedimentos preliminares relacionados a contrato, quando necessário para atender à solicitação do titular ou executar a contratação;",
            "cumprimento de obrigação legal ou regulatória, quando houver obrigação aplicável à organização;",
            "exercício regular de direitos em processos judiciais, administrativos ou arbitrais;",
            "legítimo interesse, quando aplicável e após avaliação de necessidade, finalidade e equilíbrio com os direitos e liberdades do titular;",
            "consentimento, quando for a hipótese legal adequada para determinada finalidade.",
          ]}
        />
        <p>A escolha da base legal depende da finalidade concreta do tratamento. A LGPD prevê diferentes hipóteses e não determina que todo tratamento seja baseado em consentimento.</p>
      </LegalSection>

      <LegalSection title="5. Formulário de interesse">
        <p>O formulário solicita informações essenciais: nome, empresa, cargo, WhatsApp e e-mail, objetivo e o aceite da Política de Privacidade e dos Termos de Participação.</p>
        <p>O sistema também registra informações necessárias ao atendimento e ao CRM, como origem, UTM, diagnóstico, scores internos e registros de aceite.</p>
      </LegalSection>

      <LegalSection title="6. CRM e registros de atendimento">
        <p>Os dados enviados pelo formulário são armazenados no sistema de CRM da organização, que pode registrar:</p>
        <List
          items={[
            "dados fornecidos pelo interessado;",
            "origem do lead e parâmetros UTM;",
            "diagnóstico e resposta à pergunta “Antes de decidir” (Decision Box);",
            "scores internos;",
            "histórico necessário ao atendimento;",
            "registros de aceite e versão dos documentos aceitos;",
            "registro do download da apresentação.",
          ]}
        />
        <p>O acesso aos dados é restrito às pessoas e fornecedores que precisam dessas informações para as finalidades correspondentes.</p>
      </LegalSection>

      <LegalSection title="7. Apresentação executiva">
        <p>Quando o interessado solicita a apresentação executiva, o sistema registra o download associado ao respectivo atendimento. Esse registro é usado para acompanhamento do processo comercial e não altera as finalidades desta Política.</p>
      </LegalSection>

      <LegalSection title="8. Cookies e armazenamento no navegador">
        <p>Depois do envio do formulário, o site usa um cookie de sessão estritamente necessário (<code>ip_lead</code>), válido por até 7 dias, para que você continue a inscrição e o agendamento sem preencher tudo de novo.</p>
        <p>As respostas do diagnóstico e da pergunta “Antes de decidir” ficam no armazenamento local do seu navegador. A resposta “Antes de decidir” é apagada do navegador quando o formulário é enviado; o diagnóstico permanece no navegador para personalizar a página, até você limpar os dados do site.</p>
        <p>Não utilizamos cookies de publicidade nem declaramos finalidades que não sejam efetivamente realizadas pelo sistema.</p>
      </LegalSection>

      <LegalSection title="9. Compartilhamento de dados">
        <p>Os dados poderão ser compartilhados quando necessário para as finalidades descritas nesta Política, incluindo:</p>
        <List
          items={[
            "organizadoras da PROVISION;",
            "consultores envolvidos no atendimento;",
            "fornecedores de tecnologia: hospedagem, banco de dados e CRM;",
            "serviços de comunicação, como envio de e-mail, e de agendamento;",
            "fornecedores diretamente envolvidos na execução da experiência contratada.",
          ]}
        />
        <p>O compartilhamento se limita aos dados necessários para a finalidade correspondente. Não vendemos dados.</p>
      </LegalSection>

      <LegalSection title="10. Transferência internacional">
        <p>A PROVISION possui operação relacionada ao Brasil e ao Paraguai. Dependendo dos fornecedores tecnológicos utilizados e da execução da experiência, poderá ocorrer tratamento ou transferência internacional de dados pessoais.</p>
        <p>Quando aplicável, essas operações observarão a legislação brasileira de proteção de dados e as regras da ANPD sobre transferência internacional. A estrutura definitiva, incluindo agentes, países, fornecedores e mecanismos jurídicos, está em validação pela organização.</p>
      </LegalSection>

      <LegalSection title="11. Prazo de retenção">
        <p>Os dados pessoais não devem ser mantidos por período superior ao necessário para cumprir as finalidades para as quais foram coletados, observadas as hipóteses legais de conservação.</p>
        <p>O prazo de retenção de cada categoria de dado será definido pela organização considerando a finalidade do tratamento, a existência ou não de contratação, obrigações legais e regulatórias, o exercício regular de direitos, a necessidade de manutenção de registros e a segurança da informação.</p>
      </LegalSection>

      <LegalSection title="12. Segurança">
        <p>A organização adota medidas técnicas e organizacionais compatíveis com a natureza dos dados tratados e com os riscos envolvidos, entre elas:</p>
        <List
          items={[
            "controle e restrição de acesso ao CRM;",
            "proteção de credenciais e de variáveis de ambiente;",
            "ausência de chaves privadas no site;",
            "registro cifrado do IP no aceite;",
            "limitação de envios para evitar abusos;",
            "monitoramento e tratamento de erros.",
          ]}
        />
        <p>Nenhuma medida de segurança garante risco zero. A organização busca aprimorar continuamente seus controles.</p>
      </LegalSection>

      <LegalSection title="13. Direitos do titular">
        <p>Nos termos da LGPD, o titular poderá exercer, conforme aplicável:</p>
        <List
          items={[
            "confirmação da existência de tratamento;",
            "acesso aos dados;",
            "correção de dados incompletos, inexatos ou desatualizados;",
            "informações sobre compartilhamento;",
            "eliminação de dados, quando aplicável;",
            "portabilidade, observados os requisitos legais e regulamentares;",
            "informação sobre as hipóteses legais utilizadas;",
            "revogação do consentimento, quando o tratamento estiver baseado em consentimento;",
            "oposição ao tratamento, quando cabível;",
            "demais direitos previstos na legislação.",
          ]}
        />
        <p>Os direitos não são absolutos: a legislação pode permitir ou exigir a conservação de determinados dados.</p>
      </LegalSection>

      <LegalSection title="14. Como exercer seus direitos">
        <p>
          Para solicitar informações ou exercer direitos relacionados aos seus dados pessoais, fale com a equipe PROVISION pelo WhatsApp{" "}
          <a className="text-white underline underline-offset-4" href="https://wa.me/5551997164254" target="_blank" rel="noopener noreferrer">+55 51 99716-4254</a>.
          O canal oficial de privacidade por e-mail será informado nesta página.
        </p>
        <p>A solicitação poderá exigir informações suficientes para confirmar a identidade do solicitante e proteger os dados contra acesso indevido.</p>
      </LegalSection>

      <LegalSection title="15. Dados de crianças e adolescentes">
        <p>A PROVISION é direcionada a empresários, executivos e representantes empresariais. O formulário e a experiência não são direcionados a crianças ou adolescentes. Caso a organização venha a tratar dados de crianças ou adolescentes em alguma situação específica, o tratamento será avaliado previamente conforme a legislação aplicável.</p>
      </LegalSection>

      <LegalSection title="16. Alterações desta Política">
        <p>Esta Política poderá ser atualizada para refletir alterações na operação da PROVISION, nos sistemas utilizados, nos fornecedores, nas finalidades de tratamento, na legislação e nas orientações da ANPD. Quando houver alteração relevante, a versão atualizada será disponibilizada nesta página, com nova versão.</p>
      </LegalSection>
    </LegalPage>
  );
}
