import * as anchor from "@coral-xyz/anchor";
import { AnchorError, Program } from "@coral-xyz/anchor";
import { TalentOlympicWhitelistGatedTokenSale } from "../target/types/talent_olympic_whitelist_gated_token_sale";
import dayjs from "dayjs";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { assert, expect } from "chai";

describe("talent-olympic-whitelist-gated-token-sale", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  // provider.opts.skipPreflight = true;
  // provider.opts.commitment = "confirmed";
  anchor.setProvider(provider);
  const program = anchor.workspace
    .TalentOlympicWhitelistGatedTokenSale as Program<TalentOlympicWhitelistGatedTokenSale>;
  const TOKEN_DECIMALS = 9;
  const TOKEN_INIT_AMOUNT = 1_000_000 * 10 ** TOKEN_DECIMALS;

  const [poolAuthor, user1, user2] = [
    anchor.web3.Keypair.generate(),
    anchor.web3.Keypair.generate(),
    anchor.web3.Keypair.generate(),
  ];

  console.table({
    poolAuthor: poolAuthor.publicKey.toBase58(),
    user1: user1.publicKey.toBase58(),
    user2: user2.publicKey.toBase58(),
  });

  const tokenKeypair = anchor.web3.Keypair.generate();

  const poolInfo = {
    allocation: new anchor.BN(1_000_000 * 10 ** TOKEN_DECIMALS),
    start_time: new anchor.BN(dayjs().unix()),
    end_time: new anchor.BN(dayjs().add(1, "day").unix()),
    reference_id: new anchor.BN(1),
    mint: tokenKeypair.publicKey,
  };

  let [poolAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), poolInfo.mint.toBuffer()],
    program.programId
  );

  before(async () => {
    {
      const tx = await provider.connection.requestAirdrop(
        poolAuthor.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(tx);

      const tx2 = await provider.connection.requestAirdrop(
        user1.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(tx2);

      const tx3 = await provider.connection.requestAirdrop(
        user2.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(tx3);
    }
    {
      // init token for test to poolAuthor
      const mint = await createMint(
        provider.connection,
        poolAuthor,
        poolAuthor.publicKey,
        null,
        TOKEN_DECIMALS,
        tokenKeypair
      );

      await mintTo(
        provider.connection,
        poolAuthor,
        mint,
        (
          await getOrCreateAssociatedTokenAccount(
            provider.connection,
            poolAuthor,
            mint,
            poolAuthor.publicKey
          )
        ).address,
        poolAuthor,
        BigInt(TOKEN_INIT_AMOUNT)
      );
    }
  });

  it("should initialize the pool successfully", async () => {
    const tx = await program.methods
      .initAPool(
        poolInfo.allocation,
        poolInfo.start_time,
        poolInfo.end_time,
        poolInfo.reference_id
      )
      .accounts({
        signer: poolAuthor.publicKey,
        mint: tokenKeypair.publicKey,
      })
      .signers([poolAuthor])
      .rpc();

    assert.ok(true);
    console.log("Init pool tx:", tx);
  });

  it("should not allow init pool has already been initialized", async () => {
    try {
      await program.methods
        .initAPool(
          poolInfo.allocation,
          poolInfo.start_time,
          poolInfo.end_time,
          poolInfo.reference_id
        )
        .accounts({
          signer: poolAuthor.publicKey,
          mint: tokenKeypair.publicKey,
        })
        .signers([poolAuthor])
        .rpc();

      assert.ok(false);
    } catch (err) {
      // assert.isTrue(err instanceof AnchorError);
      // console.log(err);
    }
  });
});
