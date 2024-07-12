use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;

use crate::{
    constants::{DISCRIMINATOR_SIZE, POOL_SEED},
    state::{NewPoolInitiated, Pool},
};

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
      init,
      payer = signer,
      space = DISCRIMINATOR_SIZE + Pool::INIT_SPACE,
      seeds = [POOL_SEED, mint.key().as_ref()],
      bump
    )]
    pub pool: Account<'info, Pool>,
    pub mint: Box<InterfaceAccount<'info, Mint>>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitializePool<'info> {
    pub fn handler(
        &mut self,
        allocation: u64,
        price: u64,
        start_time: i64,
        end_time: i64,
        reference_id: Option<u64>,
    ) -> Result<()> {
        self.pool.init(
            self.signer.key(),
            self.mint.key(),
            allocation,
            price,
            start_time,
            end_time,
            reference_id,
        )?;
        emit!(NewPoolInitiated {
            author: self.signer.key(),
            mint: self.mint.key(),
            allocation,
            price: price,
            start_time,
            end_time,
            reference_id,
        });
        Ok(())
    }
}
