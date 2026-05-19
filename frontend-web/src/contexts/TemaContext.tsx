"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Tema = "claro" | "escuro";

interface TemaContextType {
  tema: Tema;
  toggleTema: () => void;
  t: typeof TEMAS.claro;
}

export const TEMAS = {
  claro: {
    fundo: "#F0F4F8",
    fundoCard: "#FFFFFF",
    fundoTopbar: "#FFFFFF",
    borda: "#D1D5DB",
    textoPrincipal: "#0A0A0A",
    textoSecundario: "#374151",
    inputBg: "#F8FAFC",
    fundoInput: "#F8FAFC",
    erroFundo: "rgba(220, 38, 38, 0.05)",
    erroBorda: "rgba(220, 38, 38, 0.2)",
    erroTexto: "#DC2626",
    labelCor: "#0B1F3A",
    labelPeso: "700",
    fundoEsquerdo: "linear-gradient(135deg, #0B1F3A 0%, #1A3A5C 100%)",
    fundoStat: "#FFFFFF",
    fundoProximo: "#F0F4F8",
    bordaProximo: "#D1D5DB",
    destaque: "#0B1F3A", // azul escuro no claro
  },
  escuro: {
    fundo: "#060F1C",
    fundoCard: "#0D1F35",
    fundoTopbar: "#0D1F35",
    borda: "#1A3A5C",
    textoPrincipal: "#FFFFFF",
    textoSecundario: "#8FA3B8",
    inputBg: "#0D1F35",
    fundoInput: "#060F1C",
    erroFundo: "rgba(220, 38, 38, 0.1)",
    erroBorda: "rgba(220, 38, 38, 0.3)",
    erroTexto: "#FCA5A5",
    labelCor: "#F2B705",
    labelPeso: "400",
    fundoEsquerdo:
      "linear-gradient(135deg, #0B1F3A 0%, #060F1C 50%, #0D2847 100%)",
    fundoStat: "#0D1F35",
    fundoProximo: "#060F1C",
    bordaProximo: "#1A3A5C",
    destaque: "#F2B705", // amarelo no escuro
  },
};

const TemaContext = createContext<TemaContextType>({} as TemaContextType);

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>("claro");

  useEffect(() => {
    const salvo = localStorage.getItem("tema") as Tema;
    if (salvo) setTema(salvo);
  }, []);

  function toggleTema() {
    const novo = tema === "claro" ? "escuro" : "claro";
    setTema(novo);
    localStorage.setItem("tema", novo);
  }

  return (
    <TemaContext.Provider value={{ tema, toggleTema, t: TEMAS[tema] }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}
