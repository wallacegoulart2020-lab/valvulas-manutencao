import { useEffect, useState } from "react";

const STATUS = {
  OK: { label: "OK", color: "#d1fae5" },
  FALHA: { label: "FALHA", color: "#fee2e2" },
  MANUTENCAO: { label: "MANUTENÇÃO", color: "#fef3c7" },
};

const LINHAS_INICIAIS = {
  512: [
    { id: "V-512-01", status: "OK" },
    { id: "V-512-02", status: "OK" },
  ],
  513: [
    { id: "V-513-01", status: "OK" },
    { id: "V-513-02", status: "OK" },
  ],
  514: [
    { id: "V-514-01", status: "OK" },
    { id: "V-514-02", status: "OK" },
  ],
};

const STORAGE_KEY = "valvulas_linhas";
const HIST_KEY = "valvulas_historico";

export default function App() {
  const [linhas, setLinhas] = useState({});
  const [historico, setHistorico] = useState([]);
  const [valvulaAberta, setValvulaAberta] = useState(null);

  // carregar dados
  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);
    const hist = localStorage.getItem(HIST_KEY);

    setLinhas(salvo ? JSON.parse(salvo) : LINHAS_INICIAIS);
    setHistorico(hist ? JSON.parse(hist) : []);
  }, []);

  // salvar automaticamente
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(linhas));
  }, [linhas]);

  useEffect(() => {
    localStorage.setItem(HIST_KEY, JSON.stringify(historico));
  }, [historico]);

  const alterarStatus = (linha, id, novoStatus) => {
    setLinhas((prev) => {
      const atualizado = {
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

      return atualizado;
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
            <div key={v.id}>
              <div
                onClick={() =>
                  setValvulaAberta(
                    valvulaAberta === `${linha}-${v.id}`
                      ? null
                      : `${linha}-${v.id}`
                  )
                }
                style={{
                  background: STATUS[v.status].color,
                  padding: 10,
                  marginTop: 8,
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <strong>{v.id}</strong>

                <select
                  value={v.status}
                  onClick={(e) => e.stopPropagation()}
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

              {valvulaAberta === `${linha}-${v.id}` && (
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: 10,
                    marginTop: 6,
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                >
                  <strong>Histórico da válvula</strong>
                  {historico
                    .filter(
                      (h) =>
                        h.linha === linha && h.valvula === v.id
                    )
                    .map((h) => (
                      <div key={h.id}>
                        {h.data} — {h.status}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      <h2 style={{ marginTop: 40 }}>Histórico</h2>
      {historico.map((h) => (
        <div key={h.id} style={{ marginBottom: 6 }}>
          <strong>{h.valvula}</strong> — Linha {h.linha} —{" "}
          {h.status}
          <br />
          <small>{h.data}</small>
        </div>
      ))}
    </div>
  );
}
