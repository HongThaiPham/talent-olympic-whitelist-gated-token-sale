import { TalentOlympicWhitelistGatedTokenSale } from "@/artifacts/talent_olympic_whitelist_gated_token_sale";
import { Program, web3 } from "@coral-xyz/anchor";
import idl from "@/artifacts/talent_olympic_whitelist_gated_token_sale.json";

export default function getProgram() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

  const program = new Program<TalentOlympicWhitelistGatedTokenSale>(
    idl as TalentOlympicWhitelistGatedTokenSale,
    {
      connection,
    }
  );
  return { program, connection };
}
