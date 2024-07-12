use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;

use crate::{
    constants::POOL_SEED,
    errors::MyError,
    state::{Pool, PoolClosed},
};

#[derive(Accounts)]
pub struct ClosePool<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
      mut,
      seeds = [POOL_SEED, mint.key().as_ref()],
      bump,
      constraint = pool.author == signer.key() @MyError::Unauthorized,
      constraint = pool.can_buy == false && pool.candidate_count == 0 @MyError::CannotClosePool,
      close = signer
    )]
    pub pool: Account<'info, Pool>,
    #[account(address = pool.mint)]
    pub mint: Box<InterfaceAccount<'info, Mint>>,
}

impl<'info> ClosePool<'info> {
    pub fn handler(&mut self) -> Result<()> {
        emit!(PoolClosed {
            pool: self.pool.key(),
            author: self.pool.author,
            mint: self.pool.mint,
            allocation: self.pool.allocation,
            price: self.pool.price,
        });
        Ok(())
    }
}
