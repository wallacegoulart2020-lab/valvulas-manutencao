import { useEffect, useState } from "react";

/* ===================== STORAGE ===================== */
const STORAGE_LINHAS = "ow_linhas";
const STORAGE_HIST = "ow_historico";

/* ===================== CONFIG ===================== */
const LINHAS_CONFIG = {
  512: 175,
  513: 175,
  514: 72,
};

/* ===================== THEME ===================== */
const theme = {
  background:
    "linear-gradient(135deg, #1f2933 0%, #2b3640 45%, #1c232b 100%)",
  card: "#2f3b46",
  cardAlt: "#3a4752",
  border: "#475569",
  text: "#e5e7eb",
  muted: "#9ca3af",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#eab308",
  orange: "#fb923c",
};

/* ===================== APP ===================== */
export default function App() {
  const [linha, setLinha] = useState("512");
  const [valvula, setValvula] = useState(1);
  const [tipo, setTipo] = useState("Preventiva");
  const [data, setData] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [responsavel, setResponsavel] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");

  const [linhas, setLinhas] = useState({});
  const [historico, setHistorico] = useState([]);

  /* ===================== LOAD ===================== */
  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_LINHAS);
    const hist = localStorage.getItem(STORAGE_HIST);

    setLinhas(salvo ? JSON.parse(salvo) : {});
    setHistorico(hist ? JSON.parse(hist) : []);
  }, []);

  /* ===================== SAVE ===================== */
  useEffect(() => {
    localStorage.setItem(STORAGE_LINHAS, JSON.stringify(linhas));
  }, [linhas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_HIST, JSON.stringify(historico));
  }, [historico]);

  /* ===================== ACTION ===================== */
  const salvar = () => {
    setErro("");
    setMsg("");

    if (!responsavel.trim()) {
      setErro("Responsável é obrigatório");
      return;
    }

    const registro = {
      id: Date.now(),
      linha,
      valvula,
      tipo,
      data,
      responsavel,
      descricao,
    };

    setHistorico((h) => [registro, ...h]);

    setLinhas((prev) => ({
      ...prev,
      [linha]: {
        ...(prev[linha] || {}),
        [valvula]: {
          status: tipo,
          ultimaData: data,
        },
      },
    }));

    setDescricao("");
    setResponsavel("");
    setMsg("✔ Manutenção salva com sucesso");
  };

  /* ===================== UI ===================== */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.background,
        color: theme.text,
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 1000, margin: "auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>
          Manutenção e Controle – Sala de Válvulas OW
        </h1>
        <p style={{ color: theme.muted, marginBottom: 24 }}>
          Painel operacional de manutenção
        </p>

        {/* FILTROS */}
        <div
          style={{
            display: "flex",
            gap: 12,
            background: theme.card,
            padding: 16,
            borderRadius: 10,
            border: `1px solid ${theme.border}`,
            marginBottom: 24,
          }}
        >
          <select
            value={linha}
            onChange={(e) => setLinha(e.target.value)}
            style={selectStyle}
          >
            {Object.keys(LINHAS_CONFIG).map((l) => (
              <option key={l} value={l}>
                Linha {l}
              </option>
            ))}
          </select>

          <select
            value={valvula}
            onChange={(e) => setValvula(Number(e.target.value))}
            style={selectStyle}
          >
            {Array.from(
              { length: LINHAS_CONFIG[linha] },
              (_, i) => i + 1
            ).map((v) => (
              <option key={v} value={v}>
                Válvula {v}
              </option>
            ))}
          </select>
        </div>

        {/* MANUTENÇÃO */}
        <div
          style={{
            background: theme.cardAlt,
            padding: 20,
            borderRadius: 10,
            border: `1px solid ${theme.border}`,
          }}
        >
          <h2 style={{ marginBottom: 12 }}>Registro de Manutenção</h2>

          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              style={selectStyle}
            >
              <option>Preventiva</option>
              <option>Corretiva</option>
            </select>

            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              style={inputStyle}
            />
          </div>

          <input
            placeholder="Responsável (obrigatório)"
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            style={inputStyle}
          />

          <textarea
            placeholder="Descrição da manutenção"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={{ ...inputStyle, height: 80 }}
          />

          {erro && <p style={{ color: theme.red }}>{erro}</p>}
          {msg && <p style={{ color: theme.green }}>{msg}</p>}

          <button style={buttonStyle} onClick={salvar}>
            Salvar
          </button>
        </div>

        {/* HISTÓRICO */}
        <h2 style={{ marginTop: 32 }}>Histórico</h2>

        {historico.map((h) => (
          <div
            key={h.id}
            style={{
              background: theme.card,
              padding: 12,
              borderRadius: 8,
              marginTop: 8,
              border: `1px solid ${theme.border}`,
            }}
          >
            <strong>
              Linha {h.linha} · Válvula {h.valvula} · {h.tipo}
            </strong>
            <div style={{ fontSize: 14, color: theme.muted }}>
              {h.data} · {h.responsavel}
            </div>
            <div>{h.descricao}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== STYLES ===================== */
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  background: "#1f2933",
  color: "#e5e7eb",
  border: "1px solid #475569",
  borderRadius: 8,
  marginBottom: 10,
};

const selectStyle = {
  ...inputStyle,
  marginBottom: 0,
};

const buttonStyle = {
  marginTop: 10,
  padding: "10px 18px",
  background: "#22c55e",
  color: "#022c22",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer",
};
