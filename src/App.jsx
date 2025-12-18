import { useState, useEffect } from "react";

const STATUS = {
  OK: { label: "OK", color: "#d1fae5" },
  FALHA: { label: "FALHA", color: "#fee2e2" },
  MANUTENCAO: { label: "MANUTENÇÃO", color: "#fef3c7" },
};

const LINHAS_INICIAIS = {
  512: [
    { id: "V-512-01", status: "OK" },
    { id: "V-512-02", status: "FALHA" },
  ],
  513: [
    { id: "V-513-01", status: "OK" },
    { id: "V-513-02", status: "OK" },
  ],
  514: [
    { id: "V-514-01", status: "MANUTENCAO" },
    { id: "V-514-02", status: "OK" },
  ],
};

const STORAGE_KEY = "valvulas_app_estado";
const HIST_KEY = "valvulas_app_historico";

export default function App() {
  const [linhas, setLinhas] = useState({});
  const [historico, setHistorico] = useState([]);

  // 🔹 Carregar dados salvos
  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);
    const hist = localStorage.getItem(HIST_KEY);

    setLinhas(salvo ? JSON.parse(salvo) : LINHAS_INICIAIS);
    setHistorico(hist ? JSON.parse(hist) : []);
  }, []);

  // 🔹 Salvar automaticamente
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(linhas));
  }, [linhas]);

  useEffect(() => {
    localStorage.setItem(HIST_KEY, JSON.stringify(historico));
  }, [historico]);

  const alterarStatus = (linha, id, novoStatus) => {
    setLinhas((prev) => {
      const atualizada = {
        ...prev,
        [linha]: prev[linha].map((v) =>
          v.id === id ? { ...v, status: novoStatus } : v
        ),
      };

      setHistorico((h) => [
        {
          id: Date.now(),
          linha,
          valvula: id,
          status: novoStatus,
          data: new Date().toLocaleString("pt-BR"),
        },
        ...h,
      ]);

      return atualizada;
    });
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h1 style={{ fontSize: 32 }}>App de Monitoramento de Válvulas</h1>
      <p>Sistema de registro e histórico de manutenção</p>

      {Object.keys(linhas).map((linha) => (
        <div
          key={linha}
          style={{
            border: "2px solid #333",
            borderRadius: 10,
            padding: 16,
            marginTop: 20,
          }}
        >
          <h2>Linha {linha}</h2>

          {linhas[linha].map((v) => (
            <div
              key={v.id}
              style={{
                background: STATUS[v.status].color,
                padding: 10,
                marginTop: 8,
                borderRadius: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>{v.id}</strong>

              <select
                value={v.status}
                onChange={(e) =>
                  alterarStatus(linha, v.id, e.target.value)
                }
              >
                {Object.keys(STATUS).map((s) => (
                  <option key={s} value={s}>
                    {STATUS[s].label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginTop: 40 }}>
        <h2>Histórico</h2>

        {historico.length === 0 && <p>Nenhuma alteração registrada.</p>}

        {historico.map((h) => (
          <div
            key={h.id}
            style={{
              borderBottom: "1px solid #ccc",
              padding: "6px 0",
              fontSize: 14,
            }}
          >
            <strong>{h.valvula}</strong> – {h.status}  
            <br />
            <small>Linha {h.linha} | {h.data}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
