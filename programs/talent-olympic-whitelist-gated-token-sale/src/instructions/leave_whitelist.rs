use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;

use crate::{
    constants::{POOL_SEED, SLOT_SEED},
    errors::MyError,
    state::{Pool, Slot},
};

#[derive(Accounts)]
pub struct LeaveWhitelist<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
      mut,
      seeds = [POOL_SEED, mint.key().as_ref()],
      bump
    )]
    pub pool: Account<'info, Pool>,
    #[account(
      mut,
      seeds = [SLOT_SEED, pool.key().as_ref(), signer.key().as_ref()],
      bump,
      close = signer
    )]
    pub slot: Account<'info, Slot>,
    #[account(address = pool.mint)]
    pub mint: Box<InterfaceAccount<'info, Mint>>,
}

impl<'info> LeaveWhitelist<'info> {
    pub fn handler(&mut self) -> Result<()> {
        self.pool.candidate_count = self
            .pool
            .candidate_count
            .checked_sub(1)
            .ok_or(MyError::Overflow)?;
        Ok(())
    }
}
