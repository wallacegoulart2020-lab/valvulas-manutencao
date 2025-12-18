import { useState } from "react";

export default function App() {
  const [linhas] = useState([
    {
      id: 512,
      nome: "Linha 512",
      valvulas: [
        { id: "V-512-01", status: "OK" },
        { id: "V-512-02", status: "FALHA" }
      ]
    },
    {
      id: 513,
      nome: "Linha 513",
      valvulas: [
        { id: "V-513-01", status: "OK" },
        { id: "V-513-02", status: "OK" }
      ]
    },
    {
      id: 514,
      nome: "Linha 514",
      valvulas: [
        { id: "V-514-01", status: "MANUTENÇÃO" },
        { id: "V-514-02", status: "OK" }
      ]
    }
  ]);

  const corStatus = (status) => {
    if (status === "OK") return "#d4edda";
    if (status === "FALHA") return "#f8d7da";
    if (status === "MANUTENÇÃO") return "#fff3cd";
    return "#eee";
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <h1>App de Monitoramento de Válvulas</h1>

      <p>
        Sistema de registro e histórico de manutenção de válvulas industriais.
      </p>

      <hr />

      {linhas.map((linha) => (
        <div
          key={linha.id}
          style={{
            border: "2px solid #444",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
            backgroundColor: "#f9f9f9"
          }}
        >
          <h2>{linha.nome}</h2>

          <ul>
            {linha.valvulas.map((valvula) => (
              <li
                key={valvula.id}
                style={{
                  marginBottom: "8px",
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: corStatus(valvula.status),
                  transition: "all 0.3s ease"
                }}
              >
                <strong>{valvula.id}</strong> — Status:{" "}
                <strong>{valvula.status}</strong>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
