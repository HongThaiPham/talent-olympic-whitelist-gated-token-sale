import { web3 } from "@coral-xyz/anchor";
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
};

import getProgram from "@/lib/program";
import { ActionGetResponse, ActionPostResponse } from "@solana/actions";
type Params = {
  pool: string;
};
export async function GET(req: Request, context: { params: Params }) {
  const pool = context.params.pool;
  const poolPubkey = new web3.PublicKey(pool);
  const { program } = getProgram();

  try {
    const poolData = await program.account.pool.fetch(poolPubkey);

    const response: ActionGetResponse = {
      title: "Join token whitelist",
      label: "Join",
      description: `This action allows you to join whitelist for token ${poolData.mint.toBase58()} pool`,
      icon: "https://ucarecdn.com/59f7bf50-bbe0-43c7-a282-badebeea3a6b/-/preview/880x880/-/quality/smart/-/format/auto/",
      links: {
        actions: [
          {
            label: "Join whitelist",
            href: `${process.env.NEXT_PUBLIC_DOMAIN}/api/actions/join-whitelist/${pool}`,
          },
        ],
      },
    };

    return Response.json(response, {
      status: 200,
      headers,
    });
  } catch (error) {
    return Response.json(
      { message: "Pool not exist" },
      {
        status: 404,
        headers,
      }
    );
  }
}

export async function POST(req: Request, context: { params: Params }) {
  const body = await req.json();
  const { account } = body;
  const authority = new web3.PublicKey(account);
  const pool = context.params.pool;
  const poolPubkey = new web3.PublicKey(pool);
  const { program, connection } = getProgram();
  const poolData = await program.account.pool.fetch(poolPubkey);
  const ix = await program.methods
    .joinWhitelist()
    .accounts({
      signer: authority,
      mint: poolData.mint,
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
    message: `Join whitelist for token ${poolData.mint.toBase58()} successfully`,
  };

  return Response.json(response, {
    status: 200,
    headers,
  });
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
