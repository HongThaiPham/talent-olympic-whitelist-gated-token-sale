import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TalentOlympicWhitelistGatedTokenSale } from "../target/types/talent_olympic_whitelist_gated_token_sale";

describe("talent-olympic-whitelist-gated-token-sale", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TalentOlympicWhitelistGatedTokenSale as Program<TalentOlympicWhitelistGatedTokenSale>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
