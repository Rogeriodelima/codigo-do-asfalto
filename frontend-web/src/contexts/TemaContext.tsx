"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Tema = "claro" | "escuro";
type TamanhoFonte = "normal" | "grande" | "maior";

interface TemaContextType {
  tema: Tema;
  toggleTema: () => void;
  tamanhoFonte: TamanhoFonte;
  setTamanhoFonte: (t: TamanhoFonte) => void;
  altoContraste: boolean;
  toggleAltoContraste: () => void;
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
    destaque: "#0B1F3A",
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
    destaque: "#F2B705",
  },
};

const TAMANHOS: Record<TamanhoFonte, string> = {
  normal: "clamp(14px, 1.2vw + 10px, 18px)",
  grande: "clamp(16px, 1.4vw + 11px, 20px)",
  maior: "clamp(18px, 1.6vw + 12px, 22px)",
};

const TemaContext = createContext<TemaContextType>({} as TemaContextType);

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => {
    if (typeof window === "undefined") return "escuro";
    return (localStorage.getItem("tema") as Tema) || "escuro";
  });

  const [tamanhoFonte, setTamanhoFonteState] = useState<TamanhoFonte>(() => {
    if (typeof window === "undefined") return "normal";
    return (localStorage.getItem("tamanhoFonte") as TamanhoFonte) || "normal";
  });

  const [altoContraste, setAltoContraste] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("altoContraste") === "true";
  });

  useEffect(() => {
    document.documentElement.style.fontSize = TAMANHOS[tamanhoFonte];
  }, [tamanhoFonte]);

  useEffect(() => {
    if (altoContraste) {
      document.documentElement.style.filter = "contrast(1.25)";
    } else {
      document.documentElement.style.filter = "";
    }
  }, [altoContraste]);

  function toggleTema() {
    const novo = tema === "claro" ? "escuro" : "claro";
    setTema(novo);
    localStorage.setItem("tema", novo);
  }

  function setTamanhoFonte(t: TamanhoFonte) {
    setTamanhoFonteState(t);
    localStorage.setItem("tamanhoFonte", t);
  }

  function toggleAltoContraste() {
    const novo = !altoContraste;
    setAltoContraste(novo);
    localStorage.setItem("altoContraste", String(novo));
  }

  return (
    <TemaContext.Provider
      value={{
        tema,
        toggleTema,
        tamanhoFonte,
        setTamanhoFonte,
        altoContraste,
        toggleAltoContraste,
        t: TEMAS[tema],
      }}
    >
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}
