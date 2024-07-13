# Whitelist-gated Token Sale

### SOLANA - The Talent Olympics

## Introduction

This Whitelist-gated Token Sale program offers an optimized solution for fundraising on Solana, enabling projects to meticulously control token distribution and reward active community members. Leveraging Solana Anchor, the program ensures security, efficiency, and transparency for both the project and participants.

This program enables users to create token sale pools with a whitelist controlled by the pool creator. Other users can apply to join the whitelist and purchase tokens directly from the pool upon approval. The program also supports the creation of multiple pools, each with its own whitelist and token sale parameters.

## Features

- Create and manage multiple token sale pools with unique parameters and whitelists.
- Support token 2022.
- For simplicity, the program will transfer tokens directly upon purchase instead of utilizing a claiming mechanism.

### Pool management

- Create and manage multiple token sale pools
- Set token sale parameters for each pool include token being sold, token price (how many SOL per token), and registration period.
- Approve or reject whitelist applications
- The pool creator can cancel the pool before the purchase period begins
- The pool creator can withdraw the remaining tokens after the purchase period ends (not implemented yet).

### Whitelist management

- Apply: Users can apply to join the whitelist of a pool during the defined registration period.
- Cancel Application: Users can cancel their application before the whitelist closes.
- Approve/Reject: The pool creator can approve or reject whitelist applications.
- Purchase Limit: The pool creator can set a maximum amount of tokens each whitelisted user is allowed to purchase.

### Token Sale

- Purchase: Whitelisted users can purchase tokens directly from the pool after pool author approval.
- Purchase Limit Enforcement: Users can purchase multiple times until they reach their individual purchase limit.

### Security

- The program is designed to be secure and efficient, leveraging Solana Anchor and the Solana blockchain.
- The program is open-source, enabling the community to audit and contribute to the codebase.

## Comparison of Whitelist Storage Methods in Solana Programs

1. Array of Whitelisted Addresses

- The whitelist is stored directly within the program's account as a fixed-size array of wallet addresses.
- Advantages:

  - Simplicity: Easy to implement and manage.

  - Efficiency: Fast access and checking due to the fixed array size.

- Disadvantages:

  - Size Limitations: Restricted by the maximum size of a Solana account.

  - Inflexibility: Difficult to add or remove addresses after program deployment.

2. Vector

- The whitelist is stored as a vector, a dynamic data structure that allows adding or removing elements

- Advantages:

  - Flexibility: Can dynamically add or remove addresses.

  - Scalability: Can be expanded to accommodate a large number of addresses.

- Disadvantages:

  - Complexity: More complex to implement compared to an array.

  - Efficiency: Slower access and checking compared to fixed-size arrays.

  - Cost: Operations on Vectors (adding, removing, modifying) are more computationally expensive than arrays.

3. Merkle Tree

- The whitelist is stored as a Merkle tree, a data structure that enables efficient verification of membership.

- Advantages:

  - Efficiency: Fast verification of whitelist membership.

  - Scalability: Can accommodate a large number of addresses.

- Disadvantages:

  - Complexity: Requires additional logic for Merkle tree construction and verification.

  - Cost: Higher computational costs for Merkle tree operations.

4. HashMap

- The whitelist is stored as a HashMap, a data structure that maps keys to values.

- Advantages:

  - Flexibility: Can dynamically add or remove addresses.

  - Efficiency: Fast access and checking due to the HashMap data structure.

- Disadvantages:

  - Complexity: Requires additional logic for HashMap management.

  - Cost: Higher computational costs for HashMap operations.

5. Account **(MY CHOICE)**

- The whitelist is stored in a separate account on the Solana blockchain, with each address as a separate account data entry.

- Advantages:

  - Flexibility: Can dynamically add or remove addresses.

  - Scalability: Can accommodate a large number of addresses (maybe unlimited).

  - Efficiency: Fast access and checking due to Solana's account data structure.

  - Security: Enhanced security and privacy for whitelist data.

- Disadvantages:

  - Complexity: Requires additional account management logic.

  - Cost: Additional costs for creating and managing accounts but cost can be refunded after the program ends.

## How to use

### Install the required dependencies:

- Rust
- Solana CLI
- Anchor

### Clone the repository:

```bash
git clone git@github.com:HongThaiPham/talent-olympic-whitelist-gated-token-sale.git

cd talent-olympic-whitelist-gated-token-sale
```

### Build the program:

```bash
anchor build
```

### Run the tests:

```bash
anchor test
```

Test case:

- [x] Should initialize the pool successfully
- [x] Should not allow init pool has already been initialized
- [x] Should pool author allow close pool if have no candidate registered and status is cannot buy
- [x] Should user allow join whitelist successfully
- [x] Should user allow leave whitelist successfully
- [x] Should pool author allow approve pool can buy successfully
- [x] Should pool author allow approve user in whitelist
- [x] Should user in whitelist buy token successfully
- [x] Should slot account close when user reached limit amount
- [x] Should user not in whitelist buy token fail
- [x] Should pool author allow withdraw SOL from pool treasury
- [x] Should user not allow withdraw SOL from pool treasury

### Deploy the program:

```bash
anchor deploy
```

### User flow

- Pool author call init_a_pool to create a whitelist-gated token sale pool
- After pool created, user can apply to join the whitelist in the defined registration period by call join_whitelist
- Pool author can approve or reject the whitelist application by call set_slot
- At the end of the registration period, pool author will call approve_buy to make user can buy token from the pool
- If the whitelist application is approved, user can purchase tokens directly from the pool by call buy_token
- If the whitelist application is rejected, user can not purchase tokens from the pool
- Pool author can withdraw SOL from the pool treasury
