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
