export const getScoreLabel = (score: number): string => {
  if (score >= 4.5) {
    return "Great";
  } else if (score >= 3.5 && score < 4.5) {
    return "Good";
  } else if (score >= 2.5 && score < 3.5) {
    return "Regular";
  } else {
    return "Insufficient";
  }
};

export const getColorByScore = (score: number): string => {
  if (score >= 4.5) {
    return "#208A2A";
  } else if (score >= 3.5 && score < 4.5) {
    return "#24A19F";
  } else if (score >= 2.5 && score < 3.5) {
    return "#F5C130";
  } else {
    return "#E04040";
  }
};
