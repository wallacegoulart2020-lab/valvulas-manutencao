import { useEffect, useMemo, useState } from "react";

/* ===================== STORAGE ===================== */
const STORAGE = "ow_valvulas";
const HIST = "ow_historico";

/* ===================== CONFIG ===================== */
const LINHAS = {
  512: 175,
  513: 175,
  514: 72,
};

/* ===================== THEME ===================== */
const theme = {
  bg: "linear-gradient(135deg,#1f2933,#2b3640,#1c232b)",
  card: "#2f3b46",
  border: "#475569",
  text: "#e5e7eb",
  muted: "#9ca3af",
  red: "#ef4444",
  yellow: "#eab308",
  green: "#22c55e",
  metallic:
    "linear-gradient(90deg,#cfd8dc,#9ca3af,#e5e7eb,#9ca3af)",
};

/* ===================== APP ===================== */
export default function App() {
  const [dados, setDados] = useState({});
  const [historico, setHistorico] = useState([]);
  const [linhaSel, setLinhaSel] = useState(512);
  const [valvula, setValvula] = useState("");

  /* LOAD */
  useEffect(() => {
    setDados(JSON.parse(localStorage.getItem(STORAGE)) || {});
    setHistorico(JSON.parse(localStorage.getItem(HIST)) || []);
  }, []);

  /* SAVE */
  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(dados));
  }, [dados]);

  useEffect(() => {
    localStorage.setItem(HIST, JSON.stringify(historico));
  }, [historico]);

  /* DASHBOARD COUNTS */
  const dashboard = useMemo(() => {
    const result = {
      pendente: {},
      corretiva: {},
      ok: {},
    };

    Object.keys(LINHAS).forEach((l) => {
      let p = 0,
        c = 0,
        o = 0;
      for (let i = 1; i <= LINHAS[l]; i++) {
        const v = dados[`${l}-${i}`];
        if (!v || !v.preventiva) p++;
        else o++;
        if (v?.teveCorretiva) c++;
      }
      result.pendente[l] = p;
      result.corretiva[l] = c;
      result.ok[l] = o;
    });

    return result;
  }, [dados]);

  /* ENTER KEY */
  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.target.blur(); // fecha teclado
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "auto" }}>
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h1
            style={{
              fontSize: 32,
              background: theme.metallic,
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Manutenção e Controle – Sala de Válvulas OW
          </h1>
          <div style={{ fontSize: 40 }}>🍺 🔧</div>
          <p style={{ color: theme.muted }}>
            Gestão técnica de manutenção em sistemas de envase cervejeiro
          </p>
        </div>

        {/* DASHBOARD */}
        {!valvula && (
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 30,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <DashBox
              title="Preventivas pendentes"
              color={theme.red}
              data={dashboard.pendente}
            />
            <DashBox
              title="Com corretiva"
              color={theme.yellow}
              data={dashboard.corretiva}
            />
            <DashBox
              title="Preventivas em dia"
              color={theme.green}
              data={dashboard.ok}
            />
          </div>
        )}

        {/* SELECT LINHA */}
        <select
          value={linhaSel}
          onChange={(e) => {
            setLinhaSel(Number(e.target.value));
            setValvula("");
          }}
          style={input}
        >
          <option value={512}>Linha 512</option>
          <option value={513}>Linha 513</option>
          <option value={514}>Linha 514</option>
        </select>

        {/* INPUT VÁLVULA */}
        <input
          type="number"
          min={1}
          max={LINHAS[linhaSel]}
          placeholder={`Digite a válvula (${linhaSel})`}
          value={valvula}
          onChange={(e) => setValvula(e.target.value)}
          onKeyDown={handleKey}
          inputMode="numeric"
          style={input}
        />
      </div>
    </div>
  );
}

/* ===================== COMPONENTS ===================== */
function DashBox({ title, color, data }) {
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        background: theme.card,
        borderRadius: 14,
        padding: 16,
        border: `2px solid ${color}`,
        boxSizing: "border-box",
        lineHeight: 1.4,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 8 }}>{title}</div>
      {Object.keys(data).map((l) => (
        <div
          key={l}
          style={{
            fontSize: 14,
            color: theme.text,
          }}
        >
          {l} – {data[l]}
        </div>
      ))}
    </div>
  );
}

/* ===================== STYLES ===================== */
const input = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  background: "#1f2933",
  color: "#e5e7eb",
  border: "1px solid #475569",
  marginBottom: 12,
  boxSizing: "border-box",
};
