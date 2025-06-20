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

export const getColorByGrowth = (growth: number): string => {
  if (growth <= 0.1) {
    return "#E04040";
  } else if (growth > 0.1 && growth <= 0.3) {
    return "#F5C130";
  } else if (growth > 0.3 && growth <= 0.5) {
    return "#24A19F";
  } else {
    return "#208A2A";
  }
};
