import { useState, useEffect } from "react";

export function usePesquisaNotification() {
  const [hasNewPesquisa, setHasNewPesquisa] = useState(false);

  useEffect(() => {
    // Exemplo: lógica para detectar nova pesquisa
    // Pode ser uma chamada API real para verificar se há pesquisas novas

    // Simulação: depois de 1s, sinaliza que tem nova pesquisa
    const timer = setTimeout(() => {
      setHasNewPesquisa(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return hasNewPesquisa;
}
