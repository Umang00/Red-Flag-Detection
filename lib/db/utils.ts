import { generateId } from "ai";
import { hashSync } from "bcryptjs";

export function generateHashedPassword(password: string) {
  // bcryptjs automatically generates salt internally with 10 rounds
  const hash = hashSync(password, 10);

  return hash;
}

export function generateDummyPassword() {
  const password = generateId();
  const hashedPassword = generateHashedPassword(password);

  return hashedPassword;
}
