export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeSingleLineText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeMultilineText(value: string) {
  return value
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n")
    .trim();
}

export function normalizeEmail(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

export function normalizeUsername(value: string) {
  return value.replace(/\s+/g, "");
}

export function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function maskDocument(value: string) {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 11) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function maskCurrency(value: string) {
  const digits = onlyDigits(value);

  if (!digits) return "";

  const integerValue = Number.parseInt(digits, 10) / 100;
  return integerValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCurrencyFromNumber(value: number | string | null | undefined) {
  const numericValue = typeof value === "number" ? value : Number.parseFloat(String(value ?? 0));

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return numericValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatBRL(value: number | string | null | undefined) {
  return `R$ ${formatCurrencyFromNumber(value || 0)}`;
}

export function parseCurrency(value: string) {
  const digits = onlyDigits(value);

  if (!digits) return 0;

  return Number.parseInt(digits, 10) / 100;
}

export function maskDecimal(value: string, maxDecimals: number = 2) {
  const normalized = value.replace(/\./g, ",").replace(/[^\d,]/g, "");
  const [integerPart = "", ...decimalParts] = normalized.split(",");
  const decimals = decimalParts.join("").slice(0, maxDecimals);
  const trimmedInteger = integerPart.replace(/^0+(?=\d)/, "");

  if (normalized.includes(",")) {
    return `${trimmedInteger || "0"},${decimals}`;
  }

  return trimmedInteger;
}

export function parseDecimal(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDecimal(value: number | string | null | undefined, maxDecimals: number = 2) {
  const numericValue = typeof value === "number" ? value : Number.parseFloat(String(value ?? 0));

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return numericValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

export function normalizeDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}
