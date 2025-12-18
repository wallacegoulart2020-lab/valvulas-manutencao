import { useEffect, useState } from "react";

const STORAGE_LINHAS = "ow_linhas";
const STORAGE_HIST = "ow_historico";

const LINHAS_CONFIG = {
  512: 175,
  513: 175,
  514: 72,
};

export default function App() {
  const [linha, setLinha] = useState("512");
  const [valvula, setValvula] = useState(1);
  const [tipo, setTipo] = useState("Preventiva");
  const [data, setData] = useState(() =>
    new Date().toISOString().substring(0, 10)
  );
  const [responsavel, setResponsavel] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");

  const [linhas, setLinhas] = useState({});
  const [historico, setHistorico] = useState([]);

  // 🔹 Carregar dados
  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_LINHAS);
    const hist = localStorage.getItem(STORAGE_HIST);

    setLinhas(salvo ? JSON.parse(salvo) : {});
    setHistorico(hist ? JSON.parse(hist) : []);
  }, []);

  // 🔹 Persistir
  useEffect(() => {
    localStorage.setItem(STORAGE_LINHAS, JSON.stringify(linhas));
  }, [linhas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_HIST, JSON.stringify(historico));
  }, [historico]);

  const salvar = () => {
    setErro("");
    setMsg("");

    if (!responsavel.trim()) {
      setErro("⚠ Responsável é obrigatório");
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
    setMsg("✅ Manutenção salva com sucesso");
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h1 style={{ fontSize: 32 }}>
        Manutenção e Controle – Sala de Válvulas OW
      </h1>

      {/* FILTROS */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <select value={linha} onChange={(e) => setLinha(e.target.value)}>
          {Object.keys(LINHAS_CONFIG).map((l) => (
            <option key={l} value={l}>
              Linha {l}
            </option>
          ))}
        </select>

        <select
          value={valvula}
          onChange={(e) => setValvula(Number(e.target.value))}
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
      <h2 style={{ marginTop: 30 }}>Manutenção</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option>Preventiva</option>
          <option>Corretiva</option>
        </select>

        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </div>

      <input
        style={{ display: "block", marginTop: 10, width: "100%" }}
        placeholder="Responsável (obrigatório)"
        value={responsavel}
        onChange={(e) => setResponsavel(e.target.value)}
      />

      <textarea
        style={{ width: "100%", marginTop: 10 }}
        placeholder="Descrição da manutenção"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />

      {erro && <p style={{ color: "red" }}>{erro}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}

      <button style={{ marginTop: 10 }} onClick={salvar}>
        Salvar
      </button>

      {/* HISTÓRICO */}
      <h2 style={{ marginTop: 40 }}>Histórico</h2>

      {historico.map((h) => (
        <div key={h.id} style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
          <strong>
            V-{h.valvula} — Linha {h.linha} — {h.tipo}
          </strong>
          <br />
          {h.data} — {h.responsavel}
          <br />
          <em>{h.descricao}</em>
        </div>
      ))}
    </div>
  );
}
