import { useEffect, useState } from "react";

/* ================= CONFIG ================= */
const STORAGE = "ow_valvulas";
const HIST = "ow_historico";

const LINHAS = {
  512: { total: 175, subs: ["V1","V2","V3","V5","V6","V7","V8"] },
  513: { total: 175, subs: ["V1","V2","V3","V4","V5","V6","V7"] },
  514: { total: 72, subs: [] }
};

/* ================= APP ================= */
export default function App() {
  const [dados, setDados] = useState({});
  const [historico, setHistorico] = useState([]);

  const [tipo, setTipo] = useState(null); // preventiva | corretiva
  const [linha, setLinha] = useState(null);
  const [valvula, setValvula] = useState("");
  const [subsState, setSubsState] = useState({});
  const [toast, setToast] = useState("");

  const [modalSub, setModalSub] = useState(null);
  const [resp, setResp] = useState("");
  const [desc, setDesc] = useState("");

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

  /* HELPERS */
  const key = `${linha}-${valvula}`;

  const resetAll = () => {
    setTipo(null);
    setLinha(null);
    setValvula("");
    setSubsState({});
    setResp("");
    setDesc("");
  };

  /* TOAST */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  /* PREVENTIVA */
  const salvarPreventiva = () => {
    if (!resp) {
      alert("Responsável é obrigatório");
      return;
    }

    const novo = {
      preventiva: Date.now(),
      teveCorretiva: dados[key]?.teveCorretiva || false
    };

    setDados({ ...dados, [key]: novo });

    setHistorico([
      {
        tipo: "preventiva",
        linha,
        valvula,
        responsavel: resp,
        descricao: desc,
        data: new Date().toLocaleString("pt-BR")
      },
      ...historico
    ]);

    showToast("Preventiva salva");
  };

  /* CORRETIVA */
  const salvarCorretiva = () => {
    if (!resp || !desc) {
      alert("Responsável e descrição são obrigatórios");
      return;
    }

    setDados({
      ...dados,
      [key]: { ...dados[key], teveCorretiva: true }
    });

    setHistorico([
      {
        tipo: "corretiva",
        linha,
        valvula,
        subconjunto: modalSub,
        responsavel: resp,
        descricao: desc,
        data: new Date().toLocaleString("pt-BR")
      },
      ...historico
    ]);

    showToast("Corretiva registrada com sucesso");
    setTimeout(resetAll, 1800);
  };

  /* UI */
  return (
    <div style={styles.app}>
      {toast && <div style={styles.toast}>{toast}</div>}

      <h1 style={styles.title}>Manutenção e Controle – Sala de Válvulas OW</h1>

      {/* ETAPA 1 */}
      {!tipo && (
        <div style={styles.row}>
          <button onClick={() => setTipo("preventiva")} style={styles.btnGreen}>Preventiva</button>
          <button onClick={() => setTipo("corretiva")} style={styles.btnYellow}>Corretiva</button>
        </div>
      )}

      {/* ETAPA 2 */}
      {tipo && !linha && (
        <select onChange={e => setLinha(Number(e.target.value))} style={styles.input}>
          <option value="">Selecione a linha</option>
          <option value="512">Linha 512</option>
          <option value="513">Linha 513</option>
          <option value="514">Linha 514</option>
        </select>
      )}

      {/* ETAPA 3 */}
      {linha && !valvula && (
        <input
          type="number"
          placeholder={`Digite a válvula (1–${LINHAS[linha].total})`}
          onChange={e => setValvula(e.target.value)}
          onKeyDown={e => e.key === "Enter" && e.target.blur()}
          style={styles.input}
        />
      )}

      {/* ETAPA 4 */}
      {valvula && (
        <div style={styles.card}>
          <h3>Válvula {valvula} – Linha {linha}</h3>

          {/* SUBCONJUNTOS */}
          {LINHAS[linha].subs.length > 0 && (
            <div style={styles.subGrid}>
              {LINHAS[linha].subs.map(s => (
                <button
                  key={s}
                  style={{
                    ...styles.subBtn,
                    background:
                      tipo === "preventiva"
                        ? (subsState[s] ? "#22c55e" : "#ef4444")
                        : "#ef4444"
                  }}
                  onClick={() => {
                    if (tipo === "preventiva") {
                      setSubsState({ ...subsState, [s]: !subsState[s] });
                    } else {
                      setModalSub(s);
                    }
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* FORM */}
          <input
            placeholder="Responsável"
            value={resp}
            onChange={e => setResp(e.target.value)}
            style={styles.input}
          />
          <textarea
            placeholder="Descrição"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            style={styles.textarea}
          />

          {tipo === "preventiva" && (
            <button onClick={salvarPreventiva} style={styles.btnGreen}>
              Salvar preventiva
            </button>
          )}
        </div>
      )}

      {/* MODAL CORRETIVA */}
      {modalSub && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <h3>Corretiva – {modalSub}</h3>
            <input placeholder="Responsável" value={resp} onChange={e=>setResp(e.target.value)} style={styles.input}/>
            <textarea placeholder="Descrição" value={desc} onChange={e=>setDesc(e.target.value)} style={styles.textarea}/>
            <button onClick={salvarCorretiva} style={styles.btnYellow}>Salvar</button>
            <button onClick={()=>setModalSub(null)} style={styles.btnRed}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#1f2933,#2b3640,#1c232b)",
    padding: 20,
    color: "#e5e7eb"
  },
  title: {
    textAlign: "center",
    marginBottom: 20
  },
  row: { display: "flex", gap: 10, justifyContent: "center" },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  textarea: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    minHeight: 80,
    marginBottom: 10
  },
  card: {
    background: "#2f3b46",
    padding: 16,
    borderRadius: 12
  },
  subGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(80px,1fr))",
    gap: 8,
    marginBottom: 12
  },
  subBtn: {
    padding: 12,
    borderRadius: 10,
    color: "#fff",
    border: "none"
  },
  btnGreen: { background: "#22c55e", padding: 12, borderRadius: 8 },
  btnYellow: { background: "#eab308", padding: 12, borderRadius: 8 },
  btnRed: { background: "#ef4444", padding: 12, borderRadius: 8 },
  toast: {
    position: "fixed",
    top: 10,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#22c55e",
    color: "#000",
    padding: 10,
    borderRadius: 8,
    zIndex: 999
  },
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  modalBox: {
    background: "#1f2933",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    maxWidth: 400
  }
};
