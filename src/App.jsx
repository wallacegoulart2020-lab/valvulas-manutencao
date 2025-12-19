import { useEffect, useState } from "react";

const STORAGE_KEY = "ow_valvulas_historico_v1";

const LINHAS = {
  512: { total: 175, subconjuntos: ["V1", "V2", "V3", "V5", "V6", "V7", "V8"] },
  513: { total: 175, subconjuntos: ["V1", "V2", "V3", "V4", "V5", "V6", "V7"] },
  514: { total: 72, subconjuntos: [] },
};

export default function App() {
  const [tela, setTela] = useState("inicio");
  const [tipo, setTipo] = useState(null);
  const [linha, setLinha] = useState(null);
  const [valvula, setValvula] = useState("");
  const [subStatus, setSubStatus] = useState({});
  const [responsavel, setResponsavel] = useState("");
  const [descricao, setDescricao] = useState("");
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) setHistorico(JSON.parse(salvo));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historico));
  }, [historico]);

  function salvarRegistro(sub = null) {
    const registro = {
      id: Date.now(),
      tipo,
      linha,
      valvula,
      subconjunto: sub,
      responsavel,
      descricao,
      data: new Date().toISOString(),
    };
    setHistorico((h) => [registro, ...h]);
  }

  function resetarFluxo() {
    setTipo(null);
    setLinha(null);
    setValvula("");
    setSubStatus({});
    setResponsavel("");
    setDescricao("");
    setTela("inicio");
  }

  function contagem(l) {
    const total = LINHAS[l].total;
    const feitos = historico.filter(
      (h) => h.linha === l && h.tipo === "Preventiva"
    ).length;
    const corretiva = historico.filter(
      (h) => h.linha === l && h.tipo === "Corretiva"
    ).length;
    return { feitos, corretiva, pendente: total - feitos };
  }

  if (tela === "inicio") {
    return (
      <div className="app">
        <h1>Manutenção e Controle – Sala de Válvulas OW</h1>
        <div className="logo">🍺 🔧</div>
        <p>Gestão técnica de manutenção em sistemas de envase cervejeiro</p>

        <div className="cards">
          <div className="card red">
            <h3>Pendentes</h3>
            {Object.keys(LINHAS).map((l) => (
              <div key={l}>
                {l} – {contagem(Number(l)).pendente}
              </div>
            ))}
          </div>
          <div className="card yellow">
            <h3>Com Corretiva</h3>
            {Object.keys(LINHAS).map((l) => (
              <div key={l}>
                {l} – {contagem(Number(l)).corretiva}
              </div>
            ))}
          </div>
          <div className="card green">
            <h3>Em Dia</h3>
            {Object.keys(LINHAS).map((l) => (
              <div key={l}>
                {l} – {contagem(Number(l)).feitos}
              </div>
            ))}
          </div>
        </div>

        <div className="acoes">
          <button onClick={() => { setTipo("Preventiva"); setTela("linha"); }}>
            Preventiva
          </button>
          <button onClick={() => { setTipo("Corretiva"); setTela("linha"); }}>
            Corretiva
          </button>
          <button onClick={() => setTela("historico")}>Histórico</button>
        </div>
      </div>
    );
  }

  if (tela === "linha") {
    return (
      <div className="app">
        <h2>{tipo}</h2>
        {Object.keys(LINHAS).map((l) => (
          <button key={l} onClick={() => { setLinha(Number(l)); setTela("valvula"); }}>
            Linha {l}
          </button>
        ))}
      </div>
    );
  }

  if (tela === "valvula") {
    return (
      <div className="app">
        <h2>Linha {linha}</h2>
        <input
          type="number"
          placeholder={`Digite a válvula (1–${LINHAS[linha].total})`}
          value={valvula}
          onChange={(e) => setValvula(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setTela("sub");
          }}
        />
      </div>
    );
  }

  if (tela === "sub") {
    const subs = LINHAS[linha].subconjuntos;

    if (subs.length === 0) {
      return (
        <div className="app">
          <h2>Linha {linha} · Válvula {valvula}</h2>
          <input
            placeholder="Responsável (obrigatório)"
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
          />
          <textarea
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <button
            onClick={() => {
              if (!responsavel) return;
              salvarRegistro();
              resetarFluxo();
            }}
          >
            Salvar
          </button>
        </div>
      );
    }

    return (
      <div className="app">
        <h2>Linha {linha} · Válvula {valvula}</h2>
        <div className="subs">
          {subs.map((s) => (
            <button
              key={s}
              className={subStatus[s] ? "verde" : "vermelho"}
              onClick={() => {
                if (tipo === "Preventiva") {
                  setSubStatus((p) => ({ ...p, [s]: !p[s] }));
                } else {
                  const desc = prompt("Descrição da corretiva:");
                  if (desc) {
                    setDescricao(desc);
                    salvarRegistro(s);
                  }
                }
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {tipo === "Preventiva" && (
          <button
            onClick={() => {
              Object.keys(subStatus).forEach((s) => salvarRegistro(s));
              resetarFluxo();
            }}
          >
            Salvar
          </button>
        )}
      </div>
    );
  }

  if (tela === "historico") {
    return (
      <div className="app">
        <h2>Histórico Completo</h2>
        {historico.map((h) => (
          <div key={h.id} className="registro">
            <strong>
              Linha {h.linha} · Válvula {h.valvula} · {h.tipo}
            </strong>
            {h.subconjunto && ` · ${h.subconjunto}`}
            <div>{new Date(h.data).toLocaleString()}</div>
            <div>{h.responsavel}</div>
            <div>{h.descricao}</div>
          </div>
        ))}
        <button onClick={() => setTela("inicio")}>Voltar</button>
      </div>
    );
  }

  return null;
}
