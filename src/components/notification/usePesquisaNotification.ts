import { useState, useEffect, useCallback } from "react";
import type { Role } from "@/types";

const API_BASE_URL = "http://localhost:3000";
const LOCAL_STORAGE_RESPOSTAS_KEY = "respostas_colaborador_salvas";

interface Survey {
  id: string;
  active: boolean;
}

interface RespostaSalva {
  pesquisaId: string;
}

function fetchWithAuth<T>(url: string): Promise<T> {
  const token = localStorage.getItem("token");
  return fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  }).then((res) => {
    if (!res.ok) throw new Error("Erro ao buscar pesquisas");
    return res.json() as Promise<T>;
  });
}

export function getCurrentCycle(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const semester = month <= 6 ? 1 : 2;
  return `cycle${year}_${semester}`;
}

export function usePesquisaNotification(role: Role) {
  const [hasNewPesquisa, setHasNewPesquisa] = useState(false);

  const checkNewPesquisa = useCallback(async () => {
    if (role !== "colaborador") {
      setHasNewPesquisa(false);
      return;
    }

    const cycleId = getCurrentCycle();

    try {
      const pesquisasAbertas = await fetchWithAuth<Survey[]>(
        `${API_BASE_URL}/survey/${cycleId}/findNewestSurveys`
      );

      const respostasSalvas = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_RESPOSTAS_KEY) || "[]"
      ) as RespostaSalva[];

      const temPesquisaNova = pesquisasAbertas.some(
        (pesquisa) =>
          pesquisa.active &&
          !respostasSalvas.some((resp) => resp.pesquisaId === pesquisa.id)
      );

      setHasNewPesquisa(temPesquisaNova);
    } catch (error) {
      console.error("Erro ao verificar pesquisas novas", error);
      setHasNewPesquisa(false);
    }
  }, [role]);

  useEffect(() => {
    checkNewPesquisa();
  }, [checkNewPesquisa]);

  return hasNewPesquisa;
}