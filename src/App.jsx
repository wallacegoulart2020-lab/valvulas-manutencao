import { useEffect, useState } from "react";

/* ===================== CONFIGURAÇÕES ===================== */
const STORAGE_512 = "ow_linha_512";
const STORAGE_HIST = "ow_historico";

const SUBCONJUNTOS_512 = ["v1", "v2", "v3", "v5", "v6", "v7", "v8"];
const TOTAL_VALVULAS_512 = 175;
const VALIDADE_PREVENTIVA_MS = 1000 * 60 * 60 * 24 * 548; // 18 meses

/* ===================== TEMA ===================== */
const theme = {
  bg: "linear-gradient(135deg, #1f2933, #2b3640, #1c232b)",
  card: "#2f3b46",
  border: "#475569",
  text: "#e5e7eb",
  muted: "#9ca3af",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#eab308",
  orange: "#fb923c",
};

/* ===================== HELPERS ===================== */
const criarLinha512 = () =>
  Array.from({ length: TOTAL_VALVULAS_512 }, (_, i) => ({
    numero: i + 1,
    subconjuntos: SUBCONJUNTOS_512.reduce((acc, s) => {
      acc[s] = {
        status: "pendente",
        ultimaData: null,
        historico: [],
      };
      return acc;
    }, {}),
    ultimaPreventiva: null,
    teveCorretiva: false,
  }));

const statusSubColor = (s) =>
  s === "preventiva"
    ? theme.green
    : s === "corretiva"
    ? theme.yellow
    : theme.red;

/* ===================== APP ===================== */
export default function App() {
  const [linha512, setLinha512] = useState([]);
  const [historico, setHistorico] = useState([]);

  const [valvulaSelecionada, setValvulaSelecionada] = useState(null);
  const [subSelecionado, setSubSelecionado] = useState(null);

  const [modal, setModal] = useState(false);
  const [tipo, setTipo] = useState("preventiva");
  const [data, setData] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");

  /* ===================== LOAD ===================== */
  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_512);
    const hist = localStorage.getItem(STORAGE_HIST);

    setLinha512(salvo ? JSON.parse(salvo) : criarLinha512());
    setHistorico(hist ? JSON.parse(hist) : []);
  }, []);

  /* ===================== SAVE ===================== */
  useEffect(() => {
    localStorage.setItem(STORAGE_512, JSON.stringify(linha512));
  }, [linha512]);

  useEffect(() => {
    localStorage.setItem(STORAGE_HIST, JSON.stringify(historico));
  }, [historico]);

  /* ===================== VALIDADE AUTOMÁTICA ===================== */
  useEffect(() => {
    const agora = Date.now();
    let mudou = false;

    const nova = linha512.map((v) => {
      if (
        v.ultimaPreventiva &&
        agora - v.ultimaPreventiva > VALIDADE_PREVENTIVA_MS
      ) {
        mudou = true;
        SUBCONJUNTOS_512.forEach((s) => {
          v.subconjuntos[s].status = "pendente";
        });
        v.ultimaPreventiva = null;

        setHistorico((h) => [
          {
            id: Date.now(),
            tipo: "AUTOMÁTICO",
            linha: 512,
            valvula: v.numero,
            descricao: "Preventiva vencida automaticamente",
            data: new Date().toLocaleString("pt-BR"),
            responsavel: "Sistema",
          },
          ...h,
        ]);
      }
      return v;
    });

    if (mudou) setLinha512([...nova]);
  }, [linha512]);

  /* ===================== SALVAR MANUTENÇÃO ===================== */
  const salvar = () => {
    if (!responsavel.trim() || !descricao.trim() || !data) {
      setErro("Preencha todos os campos obrigatórios");
      return;
    }

    const nova = [...linha512];
    const v = nova[valvulaSelecionada - 1];
    const sub = v.subconjuntos[subSelecionado];

    sub.status = tipo;
    sub.ultimaData = data;
    sub.historico.push({
      tipo,
      data,
      responsavel,
      descricao,
    });

    if (tipo === "corretiva") v.teveCorretiva = true;

    const todosVerdes = SUBCONJUNTOS_512.every(
      (s) => v.subconjuntos[s].status === "preventiva"
    );

    if (todosVerdes) v.ultimaPreventiva = Date.now();

    setLinha512(nova);
    setHistorico((h) => [
      {
        id: Date.now(),
        tipo: tipo.toUpperCase(),
        linha: 512,
        valvula: v.numero,
        subconjunto: subSelecionado,
        data,
        responsavel,
        descricao,
      },
      ...h,
    ]);

    setMsg("✔ Manutenção salva com sucesso");
    setTimeout(() => setMsg(""), 2500);

    setErro("");
    setResponsavel("");
    setDescricao("");
    setData("");
    setModal(false);
  };

  /* ===================== STATUS DA VÁLVULA ===================== */
  const statusValvula = (v) => {
    if (v.teveCorretiva) return theme.orange;
    if (v.ultimaPreventiva) return theme.green;
    return theme.red;
  };

  /* ===================== UI ===================== */
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text }}>
      <div style={{ maxWidth: 1100, margin: "auto", padding: 20 }}>
        <h1>Manutenção e Controle – Sala de Válvulas OW</h1>

        {/* FILTRO VÁLVULA */}
        <select
          style={select}
          onChange={(e) => setValvulaSelecionada(Number(e.target.value))}
          value={valvulaSelecionada || ""}
        >
          <option value="">Selecione a válvula (512)</option>
          {linha512.map((v) => (
            <option key={v.numero} value={v.numero}>
              Válvula {v.numero}
            </option>
          ))}
        </select>

        {/* CARD DA VÁLVULA */}
        {valvulaSelecionada && (
          <div
            style={{
              background: theme.card,
              border: `2px solid ${statusValvula(
                linha512[valvulaSelecionada - 1]
              )}`,
              borderRadius: 12,
              padding: 16,
              marginTop: 20,
            }}
          >
            <h2>Válvula {valvulaSelecionada}</h2>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {SUBCONJUNTOS_512.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSubSelecionado(s);
                    setModal(true);
                  }}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: statusSubColor(
                      linha512[valvulaSelecionada - 1].subconjuntos[s].status
                    ),
                    color: "#022c22",
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
                Subconjunto {subSelecionado?.toUpperCase()} — Válvula{" "}
                {valvulaSelecionada}
              </h3>

              <select
                style={input}
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
              </select>

              <input
                type="date"
                style={input}
                value={data}
                onChange={(e) => setData(e.target.value)}
              />

              <input
                placeholder="Responsável"
                style={input}
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
              />

              <textarea
                placeholder="Descrição da manutenção"
                style={{ ...input, height: 80 }}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />

              {erro && <p style={{ color: theme.red }}>{erro}</p>}
              {msg && <p style={{ color: theme.green }}>{msg}</p>}

              <div style={{ display: "flex", gap: 10 }}>
                <button style={btnSave} onClick={salvar}>
                  Salvar
                </button>
                <button
                  style={btnCancel}
                  onClick={() => {
                    setModal(false);
                    setErro("");
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HISTÓRICO */}
        <h2 style={{ marginTop: 40 }}>Histórico</h2>
        {historico.map((h) => (
          <div key={h.id} style={histItem}>
            Linha 512 · V{h.valvula} · {h.subconjunto} · {h.tipo}
            <br />
            {h.data} · {h.responsavel}
            <div>{h.descricao}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== STYLES ===================== */
const select = {
  padding: 10,
  borderRadius: 8,
  background: "#1f2933",
  color: "#e5e7eb",
  border: "1px solid #475569",
};

const input = {
  width: "100%",
  padding: 10,
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
  color: "#022c22",
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
  zIndex: 1000,
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
