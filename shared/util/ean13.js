// RF22 / RN04 — dígito verificador do EAN-13. Usado pelo schema Zod (back e front).
export function ean13Valido(codigo) {
  if (typeof codigo !== 'string' || !/^\d{13}$/.test(codigo)) return false;

  const digitos = codigo.slice(0, 12).split('').map(Number);
  const soma = digitos.reduce((acc, digito, indice) => {
    return acc + (indice % 2 === 0 ? digito : digito * 3);
  }, 0);
  const resto = soma % 10;
  const dvEsperado = resto === 0 ? 0 : 10 - resto;

  return dvEsperado === Number(codigo[12]);
}
