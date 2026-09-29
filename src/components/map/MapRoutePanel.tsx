import type { RoutePoint } from "./types";

type Props = {
  selected: RoutePoint | null;
  ctaHref: string;
  onExploreDestination: () => void;
  onCta: () => void;
};

export function MapRoutePanel({ selected, ctaHref, onExploreDestination, onCta }: Props) {
  return (
    <aside className="ip-map-panel" aria-label="Rota da Imersão">
      <p className="ip-map-kicker">Brasil → Paraguai</p>
      <h2>A rota da sua próxima oportunidade.</h2>
      <dl>
        <div>
          <dt>Origem</dt>
          <dd>Brasil</dd>
        </div>
        <div>
          <dt>Destino</dt>
          <dd>Asunción, Paraguay</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>Rota estratégica</dd>
        </div>
      </dl>
      {selected ? (
        <div className="ip-map-card">
          <p className="ip-map-kicker">{selected.name}</p>
          <h3>{selected.title}</h3>
          <p>{selected.body}</p>
          {selected.items?.length ? (
            <ul>
              {selected.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="ip-map-actions">
        <button type="button" className="ip-map-ghost" onClick={onExploreDestination}>
          Explorar Asunción
        </button>
        <a className="ip-map-cta" href={ctaHref} target="_top" onClick={onCta}>
          Garantir minha vaga
        </a>
      </div>
    </aside>
  );
}
