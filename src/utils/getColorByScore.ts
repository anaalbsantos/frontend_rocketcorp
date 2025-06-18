const getColorByScore = (score: number) => {
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

export default getColorByScore;
