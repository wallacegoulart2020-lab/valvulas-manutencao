import { useEffect, useState } from "react";

/* ===================== CONFIGURAÇÃO ===================== */

const APP_NAME = "Manutenção e Controle – Sala de Válvulas OW";
const PREVENTIVA_VALIDADE_MS = 1000 * 60 * 60 * 24 * 548; // 18 meses
const STORAGE_KEY = "ow_valvulas_estado";
const HIST_KEY = "ow_valvulas_historico";
const HIST_PASSWORD = "0608";

const STATUS = {
  RED: "#ef4444",
  GREEN: "#22c55e",
  YELLOW: "#eab308",
  ORANGE: "#fb923c",
};

const SUBCONJUNTOS = {
  512: ["V1", "V2", "V3", "V5", "V6", "V7", "V8"],
  513: ["V1", "V2", "V3", "V4", "V5", "V6", "V7"],
};

/* ===================== HELPERS ===================== */

const gerarValvulas = (linha) => {
  const total = linha === 514 ? 72 : 175;
  return Array.from({ length: total }, (_, i) => ({
    numero: i + 1,
    preventivaData: null,
    corretivas: [],
    subconjuntos:
      linha === 514
        ? null
        : SUBCONJUNTOS[linha].reduce((acc, s) => {
            acc[s] = { status: "RED", corretivas: [] };
            return acc;
          }, {}),
  }));
};

/* ===================== APP ===================== */

export default function App() {
  const [linhaAtiva, setLinhaAtiva] = useState(512);
  const [valvulas, setValvulas] = useState({});
  const [valvulaSelecionada, setValvulaSelecionada] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [mensagem, setMensagem] = useState("");

  const [form, setForm] = useState({
    tipo: "",
    data: "",
    responsavel: "",
    descricao: "",
    subconjuntos: {},
  });

  const [erros, setErros] = useState({});

  /* ===================== LOAD / SAVE ===================== */

  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);
    const hist = localStorage.getItem(HIST_KEY);

    if (salvo) {
      setValvulas(JSON.parse(salvo));
    } else {
      setValvulas({
        512: gerarValvulas(512),
        513: gerarValvulas(513),
        514: gerarValvulas(514),
      });
    }

    if (hist) setHistorico(JSON.parse(hist));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valvulas));
  }, [valvulas]);

  useEffect(() => {
    localStorage.setItem(HIST_KEY, JSON.stringify(historico));
  }, [historico]);

  /* ===================== VALIDADE PREVENTIVA ===================== */

  useEffect(() => {
    const agora = Date.now();
    let alterou = false;

    const novo = { ...valvulas };

    Object.keys(novo).forEach((linha) => {
      novo[linha].forEach((v) => {
        if (
          v.preventivaData &&
          agora - v.preventivaData > PREVENTIVA_VALIDADE_MS
        ) {
          v.preventivaData = null;
          alterou = true;

          setHistorico((h) => [
            {
              id: Date.now(),
              linha,
              valvula: v.numero,
              tipo: "PREVENTIVA VENCIDA",
              data: new Date().toLocaleString("pt-BR"),
              responsavel: "Sistema",
              descricao: "Preventiva vencida automaticamente por prazo",
            },
            ...h,
          ]);
        }
      });
    });

    if (alterou) setValvulas(novo);
  }, [valvulas]);

  /* ===================== SALVAR MANUTENÇÃO ===================== */

  const validar = () => {
    const e = {};
    if (!form.tipo) e.tipo = "Obrigatório";
    if (!form.data) e.data = "Obrigatório";
    if (!form.responsavel) e.responsavel = "Obrigatório";
    if (!form.descricao) e.descricao = "Obrigatório";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const salvar = () => {
    if (!validar()) return;

    const novo = { ...valvulas };
    const v = novo[linhaAtiva][valvulaSelecionada - 1];

    if (form.tipo === "PREVENTIVA") {
      v.preventivaData = new Date(form.data).getTime();

      if (v.subconjuntos) {
        Object.keys(v.subconjuntos).forEach(
          (s) => (v.subconjuntos[s].status = "GREEN")
        );
      }
    }

    if (form.tipo === "CORRETIVA") {
      if (v.subconjuntos) {
        Object.keys(form.subconjuntos).forEach((s) => {
          v.subconjuntos[s].status = "YELLOW";
          v.subconjuntos[s].corretivas.push(form);
        });
      }
    }

    setValvulas(novo);

    setHistorico((h) => [
      {
        id: Date.now(),
        linha: linhaAtiva,
        valvula: valvulaSelecionada,
        ...form,
      },
      ...h,
    ]);

    setMensagem("✅ Manutenção salva com sucesso");
    setForm({
      tipo: "",
      data: "",
      responsavel: "",
      descricao: "",
      subconjuntos: {},
    });

    setTimeout(() => setMensagem(""), 3000);
  };

  /* ===================== HISTÓRICO RESET ===================== */

  const limparHistorico = () => {
    const senha = prompt("Digite a senha para apagar o histórico:");
    if (senha === HIST_PASSWORD) {
      setHistorico([]);
      alert("Histórico apagado");
    } else {
      alert("Senha incorreta");
    }
  };

  /* ===================== UI ===================== */

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "auto" }}>
      <h1>{APP_NAME}</h1>

      {/* Linha */}
      <select
        value={linhaAtiva}
        onChange={(e) => setLinhaAtiva(Number(e.target.value))}
      >
        <option value={512}>Linha 512</option>
        <option value={513}>Linha 513</option>
        <option value={514}>Linha 514</option>
      </select>

      {/* Válvula */}
      <select
        value={valvulaSelecionada || ""}
        onChange={(e) => setValvulaSelecionada(Number(e.target.value))}
      >
        <option value="">Selecione a válvula</option>
        {valvulas[linhaAtiva]?.map((v) => (
          <option key={v.numero} value={v.numero}>
            Válvula {v.numero}
          </option>
        ))}
      </select>

      {valvulaSelecionada && (
        <>
          <h3>Manutenção</h3>

          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            <option value="">Tipo</option>
            <option value="PREVENTIVA">Preventiva</option>
            <option value="CORRETIVA">Corretiva</option>
          </select>
          {erros.tipo && <span>{erros.tipo}</span>}

          <input
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
          />
          {erros.data && <span>{erros.data}</span>}

          <input
            placeholder="Responsável"
            value={form.responsavel}
            onChange={(e) =>
              setForm({ ...form, responsavel: e.target.value })
            }
          />
          {erros.responsavel && <span>{erros.responsavel}</span>}

          <textarea
            placeholder="Descrição"
            value={form.descricao}
            onChange={(e) =>
              setForm({ ...form, descricao: e.target.value })
            }
          />
          {erros.descricao && <span>{erros.descricao}</span>}

          <button onClick={salvar}>Salvar</button>
          {mensagem && <p>{mensagem}</p>}
        </>
      )}

      <h2>Histórico</h2>
      <button onClick={limparHistorico}>Apagar histórico</button>

      {historico.map((h) => (
        <div key={h.id} style={{ borderBottom: "1px solid #ccc" }}>
          {h.data} – Linha {h.linha} – Válvula {h.valvula} – {h.tipo}
          <br />
          {h.responsavel} – {h.descricao}
        </div>
      ))}
    </div>
  );
}
