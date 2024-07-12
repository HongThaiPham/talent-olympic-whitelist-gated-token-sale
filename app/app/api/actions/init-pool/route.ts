import getProgram from "@/lib/program";
import { web3, BN } from "@coral-xyz/anchor";
import dayjs from "dayjs";
import { ActionGetResponse, ActionPostResponse } from "@solana/actions";
import { getMint } from "@solana/spl-token";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
};

export async function GET(req: Request) {
  const response: ActionGetResponse = {
    title: "Init a new pool",
    label: "Init Pool",
    description: "This action initializes a new pool.",
    icon: "https://ucarecdn.com/59f7bf50-bbe0-43c7-a282-badebeea3a6b/-/preview/880x880/-/quality/smart/-/format/auto/",
    links: {
      actions: [
        {
          label: "Init a Whitelist-gated Token Sale Pool",
          href: `${process.env.NEXT_PUBLIC_DOMAIN}/api/actions/init-pool?mint={mint}&allocation={allocation}&price={price}&period={period}`,
          parameters: [
            {
              name: "mint",
              label: "Token mint",
            },
            {
              name: "allocation",
              label: "Allocation",
            },
            {
              name: "price",
              label: "How many lamports per token? ",
            },
            {
              name: "period",
              label: "How many days for registration?",
            },
          ],
        },
      ],
    },
  };

  return Response.json(response, {
    status: 200,
    headers,
  });
}
// api/actions/init-pool?mint={mint}&allocation={allocation}&price={price}&period={period}
export async function POST(req: Request) {
  const body = await req.json();
  const { account } = body;
  const { searchParams } = new URL(req.url);
  const { program, connection } = getProgram();
  const mint = searchParams.get("mint");
  const allocation = searchParams.get("allocation");
  const price = searchParams.get("price");
  const period = searchParams.get("period") || 10;
  const authority = new web3.PublicKey(account);

  if (!mint || !allocation || !price) {
    return Response.json(
      { message: "Missing mint or allocation" },
      {
        status: 400,
        headers,
      }
    );
  }

  const mintPublicKey = new web3.PublicKey(mint);
  const [poolAccount] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), mintPublicKey.toBuffer()],
    program.programId
  );

  try {
    const poolAccountData = await program.account.pool.fetch(poolAccount);
    if (poolAccountData.isInitialized) {
      return Response.json(
        { message: "Pool already initialized" },
        {
          status: 400,
          headers,
        }
      );
    }
  } catch (error) {
    const start_time = new BN(dayjs().subtract(5, "s").unix());
    const end_time = new BN(dayjs().add(Number(period), "day").unix());

    const mintInfo = await getMint(connection, mintPublicKey);
    const tokenAllocation = new BN(allocation).mul(
      new BN(10).pow(new BN(mintInfo.decimals))
    );
    const reference_id = new BN(1);

    const ix = await program.methods
      .initAPool(
        tokenAllocation,
        new BN(price),
        start_time,
        end_time,
        reference_id
      )
      .accounts({
        signer: authority,
        mint: mintPublicKey,
      })
      .instruction();

    const blockhash = await connection
      .getLatestBlockhash({ commitment: "max" })
      .then((res) => res.blockhash);
    const messageV0 = new web3.TransactionMessage({
      payerKey: authority,
      recentBlockhash: blockhash,
      instructions: [ix],
    }).compileToV0Message();
    const transaction = new web3.VersionedTransaction(messageV0);

    const response: ActionPostResponse = {
      transaction: Buffer.from(transaction.serialize()).toString("base64"),
      message: `Pool initialized successfully. Pool account: ${poolAccount.toBase58()}, mint: ${mint}, allocation: ${allocation}, price: ${price}, period: ${period} days`,
    };
    return Response.json(response, {
      status: 200,
      headers,
    });
  }
}

export async function OPTIONS(req: Request) {
  return Response.json(
    { message: "OPTIONS request" },
    {
      status: 200,
      headers,
    }
  );
}
