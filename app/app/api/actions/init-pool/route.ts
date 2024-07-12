import { web3 } from "@coral-xyz/anchor";

import { ActionGetResponse } from "@solana/actions";
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
  return Response.json(
    { message: "POST request" },
    {
      status: 200,
      headers,
    }
  );
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
