export const formatPendingText = (
  qtd: number,
  singular: string,
  plural: string,
  none: string
): string => {
  if (qtd === 0) return none;
  if (qtd === 1) return singular;
  return plural.replace("{X}", qtd.toString());
};
