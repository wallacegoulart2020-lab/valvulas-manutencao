import { useEffect, useState } from "react";

const STORAGE_KEY = "ow-valvulas-historico";

const LINHAS = {
  512: { total: 175, subconjuntos: ["V1","V2","V3","V5","V6","V7","V8"] },
  513: { total: 175, subconjuntos: ["V1","V2","V3","V4","V5","V6","V7"] },
  514: { total: 72, subconjuntos: [] }
};

export default function App() {
  const [tela, setTela] = useState("home");
  const [tipo, setTipo] = useState(null);
  const [linha, setLinha] = useState(null);
  const [valvulaInput, setValvulaInput] = useState("");
  const [valvula, setValvula] = useState(null);
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const h = localStorage.getItem(STORAGE_KEY);
    if (h) setHistorico(JSON.parse(h));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historico));
  }, [historico]);

  useEffect(() => {
    const onBack = () => {
      if (tela !== "home") {
        setTela("home");
        setTipo(null);
        setLinha(null);
        setValvula(null);
        setValvulaInput("");
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", onBack);
    return () => window.removeEventListener("popstate", onBack);
  }, [tela]);

  const confirmarValvula = () => {
    const n = Number(valvulaInput);
    if (!n) return;
    if (n > LINHAS[linha].total) return;
    setValvula(n);
    setTela("valvula");
  };

  const salvarRegistro = (dados) => {
    setHistorico((h) => [
      {
        id: Date.now(),
        tipo,
        linha,
        valvula,
        data: new Date().toISOString().slice(0,10),
        ...dados
      },
      ...h
    ]);
    setTela("home");
    setTipo(null);
    setLinha(null);
    setValvula(null);
    setValvulaInput("");
  };

  return (
    <div style={styles.app}>
      {tela === "home" && (
        <>
          <h1 style={styles.titulo}>
            Manutenção e Controle – Sala de Válvulas OW
          </h1>

          <div style={styles.icons}>🍺 🔧</div>

          <p style={styles.subtitulo}>
            Gestão técnica de manutenção em sistemas de envase cervejeiro
          </p>

          <div style={styles.botoes}>
            <button style={styles.btnGreen} onClick={() => { setTipo("Preventiva"); setTela("linha"); }}>
              Preventiva
            </button>
            <button style={styles.btnYellow} onClick={() => { setTipo("Corretiva"); setTela("linha"); }}>
              Corretiva
            </button>
          </div>
        </>
      )}

      {tela === "linha" && (
        <>
          <select style={styles.select} onChange={e => setLinha(e.target.value)}>
            <option>Selecione a linha</option>
            {Object.keys(LINHAS).map(l => (
              <option key={l} value={l}>Linha {l}</option>
            ))}
          </select>

          {linha && (
            <>
              <input
                style={styles.input}
                placeholder={`Digite a válvula (1–${LINHAS[linha].total})`}
                value={valvulaInput}
                inputMode="numeric"
                onChange={e => setValvulaInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && confirmarValvula()}
              />
              <button style={styles.btnGreen} onClick={confirmarValvula}>OK</button>
            </>
          )}
        </>
      )}

      {tela === "valvula" && (
        <>
          <h2 style={styles.h2}>Linha {linha} · Válvula {valvula}</h2>

          {LINHAS[linha].subconjuntos.length > 0 ? (
            <div style={styles.grid}>
              {LINHAS[linha].subconjuntos.map(s => (
                <button key={s} style={styles.subBtn}>
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <p style={styles.info}>Válvula sem subconjuntos</p>
          )}

          <button
            style={styles.btnGreen}
            onClick={() => salvarRegistro({ descricao: "Registrado" })}
          >
            Salvar
          </button>
        </>
      )}

      <h2 style={styles.historico}>Histórico</h2>
      {historico.map(h => (
        <div key={h.id} style={styles.card}>
          Linha {h.linha} · Válvula {h.valvula} · {h.tipo}
          <br />
          {h.data}
        </div>
      ))}
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#1c2b33,#2b3a44)",
    color: "#e6e6e6",
    padding: 20,
    fontFamily: "serif"
  },
  titulo: { textAlign: "center", fontSize: 28 },
  icons: { textAlign: "center", fontSize: 36, margin: 10 },
  subtitulo: { textAlign: "center", opacity: 0.8 },
  botoes: { display: "flex", justifyContent: "center", gap: 20, marginTop: 20 },
  btnGreen: { padding: "12px 20px", background: "#2ecc71", borderRadius: 10 },
  btnYellow: { padding: "12px 20px", background: "#f1c40f", borderRadius: 10 },
  select: { width: "100%", padding: 12, marginTop: 20 },
  input: { width: "100%", padding: 12, marginTop: 10 },
  h2: { marginTop: 20 },
  grid: { display: "flex", gap: 10, flexWrap: "wrap" },
  subBtn: { padding: "10px 14px", borderRadius: 20, background: "#e74c3c" },
  historico: { marginTop: 40 },
  card: { background: "#2f3e48", padding: 10, marginTop: 8 }
};
