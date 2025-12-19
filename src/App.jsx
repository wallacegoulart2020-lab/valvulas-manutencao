import { useEffect, useState } from "react";

const SUB_512 = ["V1","V2","V3","V5","V6","V7","V8"]; const SUB_513 = ["V1","V2","V3","V4","V5","V6","V7"];

const TOTAL = { 512: 175, 513: 175, 514: 72 };

export default function App() { const [view, setView] = useState("home"); // home | preventiva | corretiva | historico const [linha, setLinha] = useState(null); const [valvula, setValvula] = useState(""); const [subSelecionado, setSubSelecionado] = useState([]); const [responsavel, setResponsavel] = useState(""); const [descricao, setDescricao] = useState(""); const [historico, setHistorico] = useState(() => { const h = localStorage.getItem("historico"); return h ? JSON.parse(h) : []; });

useEffect(() => { localStorage.setItem("historico", JSON.stringify(historico)); }, [historico]);

function salvar(tipo) { const registro = { id: Date.now(), tipo, linha, valvula, subconjuntos: subSelecionado, responsavel, descricao, data: new Date().toISOString() }; setHistorico(h => [registro, ...h]); setLinha(null); setValvula(""); setSubSelecionado([]); setResponsavel(""); setDescricao(""); setView("home"); }

return ( <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#1c2b33,#263943)", color: "#e6e6e6", padding: 20 }}>

{view === "home" && (
    <>
      <h1 style={{ textAlign: "center" }}>Manutenção e Controle – Sala de Válvulas OW</h1>
      <p style={{ textAlign: "center", opacity: 0.8 }}>Gestão técnica de manutenção em sistemas de envase cervejeiro</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 30 }}>
        <button onClick={() => setView("preventiva")} style={{ padding: 15, background: "#2ecc71" }}>Preventiva</button>
        <button onClick={() => setView("corretiva")} style={{ padding: 15, background: "#f1c40f" }}>Corretiva</button>
        <button onClick={() => setView("historico")} style={{ padding: 15, background: "#3498db" }}>Histórico</button>
      </div>
    </>
  )}

  {(view === "preventiva" || view === "corretiva") && (
    <>
      {!linha && (
        <>
          <h2>Selecione a Linha</h2>
          {[512,513,514].map(l => (
            <button key={l} onClick={() => setLinha(l)} style={{ margin: 5 }}>{`Linha ${l}`}</button>
          ))}
        </>
      )}

      {linha && !valvula && (
        <>
          <h2>{`Linha ${linha}`}</h2>
          <input
            type="number"
            placeholder={`Digite a válvula (1-${TOTAL[linha]})`}
            value={valvula}
            onChange={e => setValvula(e.target.value)}
          />
        </>
      )}

      {linha && valvula && linha !== 514 && (
        <>
          <h3>{`Linha ${linha} · Válvula ${valvula}`}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {(linha === 512 ? SUB_512 : SUB_513).map(s => (
              <button
                key={s}
                onClick={() =>
                  setSubSelecionado(prev =>
                    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                  )
                }
                style={{
                  padding: 12,
                  background: subSelecionado.includes(s) ? "#2ecc71" : "#c0392b"
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {linha && valvula && (
        <>
          <input placeholder="Responsável" value={responsavel} onChange={e => setResponsavel(e.target.value)} />
          <textarea placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} />
          <button onClick={() => salvar(view)}>Salvar</button>
        </>
      )}
    </>
  )}

  {view === "historico" && (
    <>
      <h2>Histórico Completo</h2>
      <button onClick={() => setView("home")}>Voltar</button>
      {historico.map(h => (
        <div key={h.id} style={{ marginTop: 10, padding: 10, border: "1px solid #555" }}>
          <strong>{`${h.tipo.toUpperCase()} · Linha ${h.linha} · Válvula ${h.valvula}`}</strong>
          <div>{h.subconjuntos?.join(", ")}</div>
          <div>{new Date(h.data).toLocaleString("pt-BR")}</div>
          <div>{h.responsavel}</div>
          <div>{h.descricao}</div>
        </div>
      ))}
    </>
  )}

</div>

); }
