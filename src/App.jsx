import { useEffect, useState } from "react";

/* ===================== STORAGE ===================== */
const STORAGE_512 = "ow_linha_512";
const STORAGE_HIST = "ow_historico";

/* ===================== CONFIG ===================== */
const TOTAL_512 = 175;
const SUBS_512 = ["v1", "v2", "v3", "v5", "v6", "v7", "v8"];
const PREVENTIVA_MS = 1000 * 60 * 60 * 24 * 548;

/* ===================== THEME ===================== */
const theme = {
  bg: "linear-gradient(135deg,#1f2933,#2b3640,#1c232b)",
  card: "#2f3b46",
  border: "#475569",
  text: "#e5e7eb",
  muted: "#9ca3af",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#eab308",
  orange: "#fb923c",
  metallic:
    "linear-gradient(90deg,#cfd8dc,#9ca3af,#e5e7eb,#9ca3af)",
};

/* ===================== INIT ===================== */
const init512 = () =>
  Array.from({ length: TOTAL_512 }, (_, i) => ({
    numero: i + 1,
    ultimaPreventiva: null,
    teveCorretiva: false,
    subs: SUBS_512.reduce((a, s) => {
      a[s] = { status: "pendente", data: null };
      return a;
    }, {}),
  }));

/* ===================== APP ===================== */
export default function App() {
  const [linha, setLinha] = useState([]);
  const [hist, setHist] = useState([]);
  const [valvula, setValvula] = useState("");
  const [modal, setModal] = useState(null);

  const [tipo, setTipo] = useState("preventiva");
  const [data, setData] = useState("");
  const [resp, setResp] = useState("");
  const [desc, setDesc] = useState("");
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");

  /* LOAD */
  useEffect(() => {
    setLinha(
      JSON.parse(localStorage.getItem(STORAGE_512)) || init512()
    );
    setHist(JSON.parse(localStorage.getItem(STORAGE_HIST)) || []);
  }, []);

  /* SAVE */
  useEffect(() => {
    localStorage.setItem(STORAGE_512, JSON.stringify(linha));
  }, [linha]);

  useEffect(() => {
    localStorage.setItem(STORAGE_HIST, JSON.stringify(hist));
  }, [hist]);

  /* VALIDADE */
  useEffect(() => {
    const now = Date.now();
    let changed = false;

    linha.forEach((v) => {
      if (v.ultimaPreventiva && now - v.ultimaPreventiva > PREVENTIVA_MS) {
        SUBS_512.forEach((s) => (v.subs[s].status = "pendente"));
        v.ultimaPreventiva = null;
        changed = true;
        setHist((h) => [
          {
            id: Date.now(),
            tipo: "AUTOMÁTICO",
            valvula: v.numero,
            descricao: "Preventiva vencida automaticamente",
            data: new Date().toLocaleString("pt-BR"),
          },
          ...h,
        ]);
      }
    });

    if (changed) setLinha([...linha]);
  }, [linha]);

  /* SALVAR */
  const salvar = () => {
    if (!data || !resp || !desc) {
      setErro("Preencha todos os campos obrigatórios");
      return;
    }

    const v = linha[valvula - 1];
    v.subs[modal].status = tipo;
    v.subs[modal].data = data;

    if (tipo === "corretiva") v.teveCorretiva = true;

    const allGreen = SUBS_512.every(
      (s) => v.subs[s].status === "preventiva"
    );
    if (allGreen) v.ultimaPreventiva = Date.now();

    setLinha([...linha]);
    setHist((h) => [
      {
        id: Date.now(),
        tipo: tipo.toUpperCase(),
        valvula,
        subconjunto: modal,
        data,
        responsavel: resp,
        descricao: desc,
      },
      ...h,
    ]);

    setModal(null);
    setResp("");
    setDesc("");
    setData("");
    setErro("");
    setMsg("✔ Manutenção salva");
    setTimeout(() => setMsg(""), 2000);
  };

  /* STATUS */
  const corSub = (s) =>
    s === "preventiva"
      ? theme.green
      : s === "corretiva"
      ? theme.yellow
      : theme.red;

  const corValvula = (v) =>
    v.teveCorretiva
      ? theme.orange
      : v.ultimaPreventiva
      ? theme.green
      : theme.red;

  /* DASHBOARD */
  const dash = {
    red: linha.filter((v) => !v.ultimaPreventiva).length,
    yellow: linha.filter((v) => v.teveCorretiva).length,
    green: linha.filter((v) => v.ultimaPreventiva).length,
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text }}>
      <div style={{ maxWidth: 1200, margin: "auto", padding: 20 }}>
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
          <div style={{ fontSize: 40 }}>🍺🔧</div>
          <p style={{ color: theme.muted }}>
            Gestão técnica de manutenção em sistemas de envase cervejeiro
          </p>
        </div>

        {/* DASHBOARD */}
        {!valvula && (
          <div style={{ display: "flex", gap: 12, marginBottom: 30 }}>
            <DashBox color={theme.red} label="Preventivas pendentes" value={dash.red} />
            <DashBox color={theme.yellow} label="Com corretiva" value={dash.yellow} />
            <DashBox color={theme.green} label="Preventivas em dia" value={dash.green} />
          </div>
        )}

        {/* INPUT */}
        <input
          type="number"
          placeholder="Digite o número da válvula (1–175)"
          min={1}
          max={175}
          value={valvula}
          onChange={(e) => setValvula(e.target.value)}
          style={input}
        />

        {/* CARD */}
        {valvula >= 1 && valvula <= 175 && (
          <div
            style={{
              background: theme.card,
              border: `2px solid ${corValvula(linha[valvula - 1])}`,
              borderRadius: 14,
              padding: 16,
              marginTop: 20,
            }}
          >
            <h2>Válvula {valvula}</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {SUBS_512.map((s) => (
                <button
                  key={s}
                  onClick={() => setModal(s)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: corSub(linha[valvula - 1].subs[s].status),
                    fontWeight: "bold",
                  }}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODAL */}
        {modal && (
          <div style={overlay}>
            <div style={modalStyle}>
              <h3>
                Válvula {valvula} · {modal.toUpperCase()}
              </h3>

              <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={input}>
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
              </select>

              <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={input} />
              <input placeholder="Responsável" value={resp} onChange={(e) => setResp(e.target.value)} style={input} />
              <textarea placeholder="Descrição" value={desc} onChange={(e) => setDesc(e.target.value)} style={{ ...input, height: 80 }} />

              {erro && <p style={{ color: theme.red }}>{erro}</p>}
              {msg && <p style={{ color: theme.green }}>{msg}</p>}

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={salvar} style={btnSave}>Salvar</button>
                <button onClick={() => setModal(null)} style={btnCancel}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* HISTÓRICO */}
        <h2 style={{ marginTop: 40 }}>Histórico</h2>
        {hist.map((h) => (
          <div key={h.id} style={histItem}>
            V{h.valvula} · {h.subconjunto} · {h.tipo}
            <br />
            {h.data} · {h.responsavel}
            <div>{h.descricao}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== COMPONENTS ===================== */
const DashBox = ({ color, label, value }) => (
  <div style={{ flex: 1, background: "#2f3b46", borderRadius: 12, padding: 16, border: `2px solid ${color}` }}>
    <div style={{ fontSize: 28, fontWeight: "bold", color }}>{value}</div>
    <div style={{ color: "#9ca3af" }}>{label}</div>
  </div>
);

/* ===================== STYLES ===================== */
const input = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  background: "#1f2933",
  color: "#e5e7eb",
  border: "1px solid #475569",
  marginBottom: 10,
};

const btnSave = {
  flex: 1,
  padding: 10,
  borderRadius: 8,
  background: "#22c55e",
  fontWeight: "bold",
  border: "none",
};

const btnCancel = {
  flex: 1,
  padding: 10,
  borderRadius: 8,
  background: "#ef4444",
  color: "#fff",
  fontWeight: "bold",
  border: "none",
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalStyle = {
  background: "#2f3b46",
  padding: 20,
  borderRadius: 12,
  width: "100%",
  maxWidth: 420,
  border: "1px solid #475569",
};

const histItem = {
  background: "#2f3b46",
  padding: 10,
  borderRadius: 8,
  marginTop: 8,
  border: "1px solid #475569",
};
