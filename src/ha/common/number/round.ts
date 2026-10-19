export const round = (value: number, precision = 2): number =>
  Math.round(value * 10 ** precision) / 10 ** precision;

export const getNumberPrecision = (value: number): number => {
  const [coefficient, exponent = "0"] = value.toString().split("e");
  const fractionDigits = coefficient.split(".")[1]?.length ?? 0;
  return Math.max(0, fractionDigits - Number(exponent));
};
