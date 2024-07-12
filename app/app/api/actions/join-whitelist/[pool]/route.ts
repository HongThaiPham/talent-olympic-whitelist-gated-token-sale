import { TalentOlympicWhitelistGatedTokenSale } from "@/artifacts/talent_olympic_whitelist_gated_token_sale";
import { Program, web3 } from "@coral-xyz/anchor";
const PROGRAM_ID = new web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
import idl from "@/artifacts/talent_olympic_whitelist_gated_token_sale.json";
import getProgram from "@/lib/program";
type Params = {
  pool: string;
};
export async function GET(req: Request, context: { params: Params }) {
  const pool = context.params.pool;
  const program = getProgram();

  const data = program.account.pool.all();

  return Response.json({ message: pool, data });
}
