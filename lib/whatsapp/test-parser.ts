import {
  parseWhatsAppMessage,
} from "./parser";

const message = `
UKP

Tanggal: 04/10/2026
Jenis tindakan: Pemeriksaan pasien
RM: 123456
Inisial: AB
JK: L
BB: 60
TB: 165

Anamnesis:
Batuk pilek sejak 3 hari.

PF:
TD 120/80
N 88
RR 20
S 37.2

Diagnosis:
ISPA

Terapi:
Paracetamol 500 mg
`;

const result =
  parseWhatsAppMessage(message);

console.log(result);