export type WhatsAppType =
  | "UKP"
  | "UKM"
  | "TM"
  | null;

export type ParsedWhatsAppMessage = {
  type: WhatsAppType;

  fields: Record<string, string>;

  rawInput: string;
};


/* =========================================================
   NORMALIZE
========================================================= */

function normalizeKey(key: string) {
  return key
    .trim()
    .toLowerCase()
    .replace(/[./()-]/g, " ")
    .replace(/\s+/g, "_");
}


/* =========================================================
   DETECT TYPE
========================================================= */

function detectType(
  text: string
): WhatsAppType {

  const firstLine = text
    .trim()
    .split("\n")[0]
    .trim()
    .toUpperCase();

  if (firstLine === "UKP") {
    return "UKP";
  }

  if (firstLine === "UKM") {
    return "UKM";
  }

  if (
    firstLine === "TM" ||
    firstLine === "TINDAKAN MEDIS"
  ) {
    return "TM";
  }

  return null;
}


/* =========================================================
   PARSE FIELDS
========================================================= */

function parseFields(
  text: string
) {

  const fields: Record<
    string,
    string
  > = {};

  const lines = text
    .split("\n")
    .map((line) => line.trim());

  let currentKey:
    | string
    | null = null;

  for (const line of lines) {

    if (!line) {
      continue;
    }

    /*
     * Format:
     *
     * Diagnosis: ISPA
     */

    const match =
      line.match(
        /^([^:]+):\s*(.*)$/
      );

    if (match) {

      const key =
        normalizeKey(match[1]);

      const value =
        match[2].trim();

      currentKey = key;

      fields[key] = value;

      continue;
    }


    /*
     * Jika baris tidak mempunyai ":"
     * tetapi sebelumnya sedang berada
     * dalam field tertentu, tambahkan
     * sebagai lanjutan.
     */

    if (currentKey) {

      fields[currentKey] =
        fields[currentKey]
          ? `${fields[currentKey]}\n${line}`
          : line;
    }
  }

  return fields;
}


/* =========================================================
   PARSER UTAMA
========================================================= */

export function parseWhatsAppMessage(
  rawInput: string
): ParsedWhatsAppMessage {

  const type =
    detectType(rawInput);

  const fields =
    parseFields(rawInput);

  return {
    type,
    fields,
    rawInput,
  };
}