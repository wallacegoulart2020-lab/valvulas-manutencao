import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "ow_valvulas_dados";
const HIST_KEY = "ow_valvulas_historico";

const SUBCONJUNTOS_512 = ["V1","V2","V3","V5","V6","V7","V8"];

const bg = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#1f2a33,#2b3a45,#1f2a33)",
  color: "#e5e7eb",
  padding: 20,
  boxSizing: "border-box"
};

const card = {
  background: "#2b3a45",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,.4)",
  marginBottom: 20,
  overflow: "hidden"
};

export default function App() {
  const [valvula, setValvula] = useState("");
  const [dados, setDados] = useState({});
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);
    const hist = localStorage.getItem(HIST_KEY);
    if (salvo) setDados(JSON.parse(salvo));
    if (hist) setHistorico(JSON.parse(hist));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  }, [dados]);

  useEffect(() => {
    localStorage.setItem(HIST_KEY, JSON.stringify(historico));
  }, [historico]);

  const dashboard = useMemo(() => {
    let pendente = 0, corretiva = 0, ok = 0;
    for (let i = 1; i <= 175; i++) {
      const v = dados[i];
      if (!v || !v.preventiva) pendente++;
      else ok++;
      if (v?.teveCorretiva) corretiva++;
    }
    return { pendente, corretiva, ok };
  }, [dados]);

  const toggleSub = (sub) => {
    if (!valvula) return;
    setDados(prev => {
      const atual = prev[valvula] || {};
      const subs = atual.subs || {};
      const novo = {
        ...prev,
        [valvula]: {
          ...atual,
          preventiva: true,
          subs: {
            ...subs,
            [sub]: !subs[sub]
          }
        }
      };
      return novo;
    });

    setHistorico(h => [
      {
        id: Date.now(),
        linha: 512,
        valvula,
        subconjunto: sub,
        tipo: "PREVENTIVA",
        data: new Date().toISOString().slice(0,10),
        responsavel: "Wallace",
        desc: "Realizado"
      },
      ...h
    ]);
  };

  return (
    <div style={bg}>
      {/* HEADER */}
      <div style={{ textAlign:"center", marginBottom: 30 }}>
        <h1 style={{
          fontSize: 34,
          marginBottom: 8,
          background: "linear-gradient(90deg,#d1d5db,#9ca3af,#e5e7eb)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Manutenção e Controle – Sala de Válvulas OW
        </h1>
        <div style={{ fontSize: 42 }}>🍺 🔧</div>
        <p style={{ opacity:.8 }}>
          Gestão técnica de manutenção em sistemas de envase cervejeiro
        </p>
      </div>

      {/* DASHBOARD */}
      {!valvula && (
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom: 20 }}>
          <div style={{ ...card, border:"2px solid #ef4444", flex:1 }}>
            <h2 style={{ color:"#ef4444" }}>{dashboard.pendente}</h2>
            Preventivas pendentes
          </div>
          <div style={{ ...card, border:"2px solid #facc15", flex:1 }}>
            <h2 style={{ color:"#facc15" }}>{dashboard.corretiva}</h2>
            Com corretiva
          </div>
          <div style={{ ...card, border:"2px solid #22c55e", flex:1 }}>
            <h2 style={{ color:"#22c55e" }}>{dashboard.ok}</h2>
            Preventivas em dia
          </div>
        </div>
      )}

      {/* INPUT VÁLVULA */}
      <div style={card}>
        <input
          type="number"
          min={1}
          max={175}
          placeholder="Digite o número da válvula (1–175)"
          value={valvula}
          onChange={e => setValvula(e.target.value)}
          style={{
            width:"100%",
            padding:14,
            fontSize:16,
            borderRadius:12,
            border:"1px solid #374151",
            background:"#1f2933",
            color:"#fff",
            boxSizing:"border-box"
          }}
        />
      </div>

      {/* VÁLVULA */}
      {valvula && (
        <div style={{ ...card, border:"2px solid #ef4444" }}>
          <h2>Válvula {valvula}</h2>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {SUBCONJUNTOS_512.map(s => {
              const ativo = dados[valvula]?.subs?.[s];
              return (
                <button
                  key={s}
                  onClick={() => toggleSub(s)}
                  style={{
                    padding:"10px 18px",
                    borderRadius:12,
                    border:"none",
                    background: ativo ? "#22c55e" : "#ef4444",
                    color:"#000",
                    fontWeight:"bold"
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* HISTÓRICO */}
      <div style={card}>
        <h2>Histórico</h2>
        {historico.slice(0,10).map(h => (
          <div key={h.id} style={{
            background:"#1f2933",
            padding:12,
            borderRadius:10,
            marginBottom:10
          }}>
            Linha {h.linha} · V{h.valvula} · {h.subconjunto} · {h.tipo}<br/>
            {h.data} · {h.responsavel}<br/>
            {h.desc}
          </div>
        ))}
      </div>
    </div>
  );
}
