use anchor_lang::{
    prelude::*,
    system_program::{self, Transfer},
};
use anchor_spl::token_interface::Mint;

use crate::{
    constants::{POOL_SEED, TREASURY_SEED},
    errors::MyError,
    state::Pool,
};

#[derive(Accounts)]
pub struct WithdrawTreasury<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
      mut,
      seeds = [POOL_SEED, mint.key().as_ref()],
      bump,
      constraint = pool.author == signer.key() @MyError::Unauthorized,
    )]
    pub pool: Account<'info, Pool>,
    #[account(address = pool.mint)]
    pub mint: Box<InterfaceAccount<'info, Mint>>,
    /// CHECK: keeper
    #[account(
      mut,
      seeds = [TREASURY_SEED, pool.key().as_ref(), pool.author.as_ref()],
      bump,
    )]
    pub pool_treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> WithdrawTreasury<'info> {
    pub fn handler(&mut self, bumps: WithdrawTreasuryBumps) -> Result<()> {
        let lamports = self.pool_treasury.lamports();
        let accounts = Transfer {
            from: self.pool_treasury.to_account_info(),
            to: self.signer.to_account_info(),
        };

        let signer_seeds: [&[&[u8]]; 1] = [&[
            TREASURY_SEED,
            self.pool.to_account_info().key.as_ref(),
            self.signer.to_account_info().key.as_ref(),
            &[bumps.pool_treasury],
        ]];

        let ctx = CpiContext::new_with_signer(
            self.system_program.to_account_info(),
            accounts,
            &signer_seeds,
        );

        system_program::transfer(ctx, lamports)
    }
}
