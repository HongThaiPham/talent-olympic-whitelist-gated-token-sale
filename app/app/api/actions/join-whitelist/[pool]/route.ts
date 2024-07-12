import { web3 } from "@coral-xyz/anchor";

import getProgram from "@/lib/program";
type Params = {
  pool: string;
};
export async function GET(req: Request, context: { params: Params }) {
  const pool = context.params.pool;
  const { program } = getProgram();

  const data = program.account.pool.all();

  return Response.json({ message: pool, data });
}
