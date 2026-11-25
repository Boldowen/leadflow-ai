import "server-only";
import bcrypt from "bcryptjs";

const COST = 12;
// Compared against when the email is unknown, so a login takes the same time either way.
const DUMMY_HASH = bcrypt.hashSync("timing-equalizer-not-a-password", COST);

export const hashPassword = (password: string) => bcrypt.hash(password, COST);

/** Always runs one bcrypt comparison, whether or not the account exists. */
export async function verifyPassword(password: string, hash: string | null | undefined) {
  const ok = await bcrypt.compare(password, hash ?? DUMMY_HASH);
  return Boolean(hash) && ok;
}
