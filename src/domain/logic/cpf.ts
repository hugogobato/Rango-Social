/**
 * Validates a Brazilian CPF number using the standard 11-digit checksum algorithm.
 */
export function validateCpf(cpf: string): boolean {
  // Remove non-digit characters
  const cleanCpf = cpf.replace(/\D/g, '')

  // Must be exactly 11 digits
  if (cleanCpf.length !== 11) return false

  // Reject known invalid patterns (all digits same)
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false

  // Calculate first verifier digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i)
  }
  let remainder = sum % 11
  const verifier1 = remainder < 2 ? 0 : 11 - remainder

  if (parseInt(cleanCpf.charAt(9)) !== verifier1) return false

  // Calculate second verifier digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i)
  }
  remainder = sum % 11
  const verifier2 = remainder < 2 ? 0 : 11 - remainder

  if (parseInt(cleanCpf.charAt(10)) !== verifier2) return false

  return true
}

/**
 * Format string as CPF: 000.000.000-00
 */
export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}
