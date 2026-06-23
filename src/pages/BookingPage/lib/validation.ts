/**
 * Validates a Kazakhstani IIN (Individual Identification Number)
 * using the official weighted checksum algorithm.
 */
export function validateIIN(iin: string): boolean {
  if (!/^\d{12}$/.test(iin)) {
    return false;
  }

  // Basic date validity check (first 6 digits: YYMMDD)
  const month = parseInt(iin.substring(2, 4), 10);
  const day = parseInt(iin.substring(4, 6), 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const digits = iin.split("").map(Number);
  
  // Weight vector 1
  const w1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += digits[i] * w1[i];
  }

  let control = sum % 11;
  
  // If control is 10, run second round with weight vector 2
  if (control === 10) {
    const w2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
    sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += digits[i] * w2[i];
    }
    control = sum % 11;
  }

  // If control is still 10, this IIN is considered invalid
  if (control === 10) {
    return false;
  }

  return digits[11] === control;
}

/**
 * Auto-formats phone numbers to +7 (7XX) XXX-XX-XX format as the user types
 */
export function formatPhone(value: string): string {
  if (!value) return "";
  
  // Remove all non-digits
  let digits = value.replace(/\D/g, "");

  // If starts with 8, normalize to 7
  if (digits.startsWith("8")) {
    digits = "7" + digits.substring(1);
  } else if (digits.length > 0 && !digits.startsWith("7")) {
    // Ensure we prepend 7 if user starts typing another digit
    digits = "7" + digits;
  }

  // Max length of Kazakhstani phone number digits is 11 (e.g. 77071234567)
  digits = digits.substring(0, 11);

  if (digits.length === 0) return "";
  if (digits.length === 1) return "+7";
  
  let formatted = "+7";
  if (digits.length > 1) {
    const part1 = digits.substring(1, 4);
    formatted += ` (${part1}`;
  }
  if (digits.length >= 4) {
    const part2 = digits.substring(4, 7);
    formatted += `) ${part2}`;
  }
  if (digits.length >= 7) {
    const part3 = digits.substring(7, 9);
    formatted += `-${part3}`;
  }
  if (digits.length >= 9) {
    const part4 = digits.substring(9, 11);
    formatted += `-${part4}`;
  }

  return formatted;
}

/**
 * Validates if the phone number matches the format: +7 (7XX) XXX-XX-XX
 */
export function isValidPhone(phone: string): boolean {
  return /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/.test(phone);
}
