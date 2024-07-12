import { web3 } from "@coral-xyz/anchor";

import { ActionGetResponse } from "@solana/actions";

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

  return Response.json(response);
}
