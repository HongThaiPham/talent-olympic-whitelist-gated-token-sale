import getProgram from "@/lib/program";
import { web3, BN } from "@coral-xyz/anchor";

import { ActionGetResponse, ActionPostResponse } from "@solana/actions";
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
    icon: "https://i.ibb.co/xLnRRzF/bg.png",
    links: {
      actions: [
        {
          label: "Init Pool",
          href: `${process.env.NEXT_PUBLIC_DOMAIN}/actions/init-pool`,
          parameters: [
            {
              name: "mint",
              label: "Token mint",
            },
            {
              name: "allocation",
              label: "Allocation",
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

export async function POST(req: Request) {
  const body = await req.json();
  const { account } = body;
  const program = getProgram();

  // const poolInfo = {
  //   allocation: new BN(1_000_000 * 10 ** TOKEN_DECIMALS),
  //   start_time: new BN(dayjs().subtract(5, "s").unix()),
  //   end_time: new BN(dayjs().add(1, "day").unix()),
  //   reference_id: new BN(1),
  //   mint: tokenKeypair.publicKey,
  //   price: new anchor.BN(TOKEN_PRICE),
  // };

  //   const transaction = program.methods.initAPool()

  const response: ActionPostResponse = {
    transaction: Buffer.from(account, "base64").toString(),
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
