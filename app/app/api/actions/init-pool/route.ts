import { web3 } from "@coral-xyz/anchor";
const PROGRAM_ID = new web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);

import { ActionGetResponse } from "@solana/actions";

type Params = {
  pool: string;
};
export async function GET(req: Request, context: { params: Params }) {
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

  return Response.json(response);
}
