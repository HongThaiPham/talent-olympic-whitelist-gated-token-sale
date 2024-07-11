use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;

use crate::{
    constants::{DISCRIMINATOR_SIZE, POOL_SEED, SLOT_SEED},
    errors::MyError,
    state::{Pool, Slot},
};

#[derive(Accounts)]
pub struct JoinWhitelist<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
      mut,
      seeds = [POOL_SEED, mint.key().as_ref()],
      bump
    )]
    pub pool: Account<'info, Pool>,
    #[account(
      init,
      payer = signer,
      space = DISCRIMINATOR_SIZE + Slot::INIT_SPACE,
      seeds = [SLOT_SEED, pool.key().as_ref(), signer.key().as_ref()],
      bump
    )]
    pub slot: Account<'info, Slot>,
    #[account(address = pool.mint)]
    pub mint: Box<InterfaceAccount<'info, Mint>>,
    pub system_program: Program<'info, System>,
}

impl<'info> JoinWhitelist<'info> {
    pub fn handler(&mut self) -> Result<()> {
        self.slot.init(self.pool.key())?;
        self.pool.candidate_count = self
            .pool
            .candidate_count
            .checked_add(1)
            .ok_or(MyError::Overflow)?;
        Ok(())
    }
}
