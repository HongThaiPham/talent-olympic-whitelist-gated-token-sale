use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;

use crate::{
    constants::{POOL_SEED, SLOT_SEED},
    errors::MyError,
    state::{Pool, Slot},
};

#[derive(Accounts)]
#[instruction(wallet: Pubkey)]
pub struct SetSlot<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
      seeds = [POOL_SEED, mint.key().as_ref()],
      bump,
      constraint = pool.author == signer.key() @MyError::Unauthorized,
    )]
    pub pool: Account<'info, Pool>,
    #[account(
      mut,
      seeds = [SLOT_SEED, pool.key().as_ref(), wallet.as_ref()],
      bump,
      constraint = slot.pool == pool.key() @MyError::Unauthorized,
    )]
    pub slot: Account<'info, Slot>,
    #[account(address = pool.mint)]
    pub mint: Box<InterfaceAccount<'info, Mint>>,
}

impl<'info> SetSlot<'info> {
    pub fn handler(
        &mut self,
        _wallet: Pubkey,
        in_whitelist: bool,
        limit_amount: u64,
    ) -> Result<()> {
        self.slot
            .set_slot(self.pool.key(), in_whitelist, limit_amount)?;
        Ok(())
    }
}
