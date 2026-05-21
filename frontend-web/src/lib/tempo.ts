export function tempoRelativo(data: string): string {
  const agora = new Date();
  const passado = new Date(data);
  const diff = Math.floor((agora.getTime() - passado.getTime()) / 1000);

  if (diff < 60) return "agora mesmo";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  if (diff < 172800) return "ontem";
  if (diff < 604800) return `há ${Math.floor(diff / 86400)} dias`;
  if (diff < 2592000) return `há ${Math.floor(diff / 604800)} semana${Math.floor(diff / 604800) > 1 ? "s" : ""}`;
  if (diff < 31536000) return `há ${Math.floor(diff / 2592000)} mês${Math.floor(diff / 2592000) > 1 ? "es" : ""}`;
  return `há ${Math.floor(diff / 31536000)} ano${Math.floor(diff / 31536000) > 1 ? "s" : ""}`;
}
