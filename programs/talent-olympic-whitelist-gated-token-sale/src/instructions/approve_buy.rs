use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;

use crate::{constants::POOL_SEED, errors::MyError, state::Pool};

#[derive(Accounts)]
pub struct ApproveBuy<'info> {
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
}

impl<'info> ApproveBuy<'info> {
    pub fn handler(&mut self) -> Result<()> {
        self.pool.approve_buy(self.signer.key())?;
        Ok(())
    }
}
