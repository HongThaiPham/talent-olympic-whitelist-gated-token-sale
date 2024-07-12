import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TalentOlympicWhitelistGatedTokenSale } from "../target/types/talent_olympic_whitelist_gated_token_sale";
import dayjs from "dayjs";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { assert } from "chai";

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
  const TOKEN_PRICE = 1_000_000; // 0.001 SOL per token
  const LIMIT_AMOUNT = 1_000 * 10 ** TOKEN_DECIMALS;

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
  const tokenKeypairForClose = anchor.web3.Keypair.generate();

  const poolInfo = {
    allocation: new anchor.BN(1_000_000 * 10 ** TOKEN_DECIMALS),
    start_time: new anchor.BN(dayjs().unix()),
    end_time: new anchor.BN(dayjs().add(1, "day").unix()),
    reference_id: new anchor.BN(1),
    mint: tokenKeypair.publicKey,
    price: new anchor.BN(TOKEN_PRICE),
  };

  const [poolAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), poolInfo.mint.toBuffer()],
    program.programId
  );

  const [slotAccountUser1] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("slot"), poolAccount.toBuffer(), user1.publicKey.toBuffer()],
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
    {
      const mintForClose = await createMint(
        provider.connection,
        poolAuthor,
        poolAuthor.publicKey,
        null,
        TOKEN_DECIMALS,
        tokenKeypairForClose
      );

      await mintTo(
        provider.connection,
        poolAuthor,
        mintForClose,
        (
          await getOrCreateAssociatedTokenAccount(
            provider.connection,
            poolAuthor,
            mintForClose,
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
        poolInfo.price,
        poolInfo.start_time,
        poolInfo.end_time,
        poolInfo.reference_id
      )
      .accounts({
        signer: poolAuthor.publicKey,
        mint: poolInfo.mint,
      })
      .signers([poolAuthor])
      .rpc();

    assert.ok(true);
    const poolAccountData = await program.account.pool.fetch(poolAccount);
    assert.equal(poolAccountData.isInitialized, true);
    assert.equal(
      poolAccountData.allocation.toNumber(),
      poolInfo.allocation.toNumber()
    );
    assert.equal(
      poolAccountData.startTime.toNumber(),
      poolInfo.start_time.toNumber()
    );
    assert.equal(
      poolAccountData.endTime.toNumber(),
      poolInfo.end_time.toNumber()
    );
    assert.equal(
      poolAccountData.referenceId.toNumber(),
      poolInfo.reference_id.toNumber()
    );
    assert.equal(poolAccountData.canBuy, false);
    assert.equal(poolAccountData.mint.toBase58(), poolInfo.mint.toBase58());
    assert.equal(
      poolAccountData.author.toBase58(),
      poolAuthor.publicKey.toBase58()
    );
    assert.equal(poolAccountData.candidateCount.toNumber(), 0);

    console.log("Init pool tx:", tx);
  });

  it("should not allow init pool has already been initialized", async () => {
    try {
      await program.methods
        .initAPool(
          poolInfo.allocation,
          poolInfo.price,
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
    } catch (error) {
      assert.isNotNull(error);
    }
  });

  it("Should pool author allow close pool if have no candidate registered and status is cannot buy", async () => {
    const poolInfoForClose = {
      allocation: new anchor.BN(1_000_000 * 10 ** TOKEN_DECIMALS),
      start_time: new anchor.BN(dayjs().unix()),
      end_time: new anchor.BN(dayjs().add(1, "day").unix()),
      reference_id: new anchor.BN(1),
      mint: tokenKeypairForClose.publicKey,
      price: new anchor.BN(TOKEN_PRICE),
    };
    let tx = await program.methods
      .initAPool(
        poolInfoForClose.allocation,
        poolInfoForClose.price,
        poolInfoForClose.start_time,
        poolInfoForClose.end_time,
        poolInfoForClose.reference_id
      )
      .accounts({
        signer: poolAuthor.publicKey,
        mint: poolInfoForClose.mint,
      })
      .signers([poolAuthor])
      .rpc();

    assert.ok(true);

    tx = await program.methods
      .closePool()
      .accounts({
        signer: poolAuthor.publicKey,
        mint: poolInfoForClose.mint,
      })
      .signers([poolAuthor])
      .rpc();

    assert.ok(true);

    try {
      const [poolAccountForClose] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("pool"), poolInfoForClose.mint.toBuffer()],
          program.programId
        );
      const poolAccountData = await program.account.pool.fetch(
        poolAccountForClose
      );

      assert.equal(poolAccountData.isInitialized, false);
      assert.ok(false);
    } catch (error) {
      assert.isNotNull(error);
    }

    console.log("Close pool tx:", tx);
  });

  it("should user allow join whitelist successfully", async () => {
    const tx = await program.methods
      .joinWhitelist()
      .accounts({
        signer: user1.publicKey,
        mint: poolInfo.mint,
      })
      .signers([user1])
      .rpc();

    assert.ok(true);
    const poolAccountData = await program.account.pool.fetch(poolAccount);
    assert.equal(poolAccountData.candidateCount.toNumber(), 1);
    console.log("Join whitelist tx:", tx);
  });

  it("should user allow leave whitelist successfully", async () => {
    let tx = await program.methods
      .joinWhitelist()
      .accounts({
        signer: user2.publicKey,
        mint: poolInfo.mint,
      })
      .signers([user2])
      .rpc();

    tx = await program.methods
      .leaveWhitelist()
      .accounts({
        signer: user2.publicKey,
        mint: poolInfo.mint,
      })
      .signers([user2])
      .rpc();

    assert.ok(true);
    const poolAccountData = await program.account.pool.fetch(poolAccount);
    assert.equal(poolAccountData.candidateCount.toNumber(), 1);
    console.log("Leave whitelist tx:", tx);
  });

  it("Should pool author allow approve pool can buy successfully", async () => {
    const tx = await program.methods
      .approveBuy()
      .accounts({ signer: poolAuthor.publicKey, mint: poolInfo.mint })
      .signers([poolAuthor])
      .rpc();

    assert.ok(true);
    const poolAccountData = await program.account.pool.fetch(poolAccount);
    assert.equal(poolAccountData.canBuy, true);
    console.log("Approve buy tx:", tx);
  });

  it("Should pool author allow approve user in whitelist", async () => {
    const tx = await program.methods
      .setSlot(user1.publicKey, true, new anchor.BN(LIMIT_AMOUNT))
      .accountsPartial({
        signer: poolAuthor.publicKey,
        mint: poolInfo.mint,
        pool: poolAccount,
        slot: slotAccountUser1,
      })
      .signers([poolAuthor])
      .rpc();

    assert.ok(true);
    const slotAccountData = await program.account.slot.fetch(slotAccountUser1);
    assert.equal(slotAccountData.inWhitelist, true);
    assert.equal(slotAccountData.limitAmount.toNumber(), LIMIT_AMOUNT);
    console.log("Approve user in whitelist tx:", tx);
  });
});
