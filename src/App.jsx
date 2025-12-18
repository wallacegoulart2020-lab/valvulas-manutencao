import { useState } from "react";

export default function App() {
  const [linhas, setLinhas] = useState([
    {
      id: 512,
      nome: "Linha 512",
      valvulas: [
        {
          id: "V-01",
          status: "OK",
          falhas: []
        },
        {
          id: "V-02",
          status: "Falha",
          falhas: [
            {
              data: "2025-12-10",
              descricao: "Vazamento no selo",
              tipo: "Mecânica"
            }
          ]
        }
      ]
    },
    {
      id: 513,
      nome: "Linha 513",
      valvulas: [
        {
          id: "V-10",
          status: "OK",
          falhas: []
        }
      ]
    }
  ]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>App de Monitoramento de Válvulas</h1>

      {linhas.map((linha) => (
        <div key={linha.id} style={{ marginBottom: 20 }}>
          <h2>{linha.nome}</h2>

          {linha.valvulas.map((valvula) => (
            <div
              key={valvula.id}
              style={{
                padding: 10,
                marginBottom: 10,
                border: "1px solid #ccc",
                borderRadius: 6
              }}
            >
              <strong>Válvula {valvula.id}</strong>  
              <div>Status: {valvula.status}</div>

              {valvula.falhas.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <em>Histórico de falhas:</em>
                  <ul>
                    {valvula.falhas.map((falha, index) => (
                      <li key={index}>
                        {falha.data} – {falha.tipo} – {falha.descricao}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
