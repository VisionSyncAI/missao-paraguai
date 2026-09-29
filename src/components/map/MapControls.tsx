type Props = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onExplore: () => void;
  onReset: () => void;
};

export function MapControls({ onZoomIn, onZoomOut, onFit, onExplore, onReset }: Props) {
  return (
    <div className="ip-map-controls" role="group" aria-label="Controles do mapa">
      <button type="button" onClick={onZoomIn} aria-label="Aproximar">
        +
      </button>
      <button type="button" onClick={onZoomOut} aria-label="Afastar">
        −
      </button>
      <button type="button" onClick={onFit} aria-label="Minha rota">
        ⌖
      </button>
      <button type="button" onClick={onExplore} aria-label="Explorar">
        ↗
      </button>
      <button type="button" onClick={onReset} aria-label="Redefinir mapa">
        Reset
      </button>
    </div>
  );
}
