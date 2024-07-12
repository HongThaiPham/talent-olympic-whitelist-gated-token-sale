use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{
    constants::{POOL_SEED, SLOT_SEED},
    state::{Pool, Slot},
};

#[derive(Accounts)]
pub struct BuyToken<'info> {
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
    #[account(
      mut,
      associated_token::mint = mint,
      associated_token::authority = signer
  )]
    pub signer_token_account: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
      mut,
      associated_token::mint = mint,
      associated_token::authority = pool,
      associated_token::token_program = token_program,
  )]
    pub pool_token_account: Box<InterfaceAccount<'info, TokenAccount>>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> BuyToken<'info> {
    pub fn handler(&mut self, amount: u64, bumps: BuyTokenBumps) -> Result<()> {
        self.slot.buy_token(amount)?;
        self.transfer_token_from_pool_to_user(amount, bumps.pool)?;
        Ok(())
    }

    fn transfer_token_from_pool_to_user(&mut self, amount: u64, pool_bumps: u8) -> Result<()> {
        let accounts = TransferChecked {
            from: self.pool_token_account.to_account_info(),
            mint: self.mint.to_account_info(),
            to: self.signer_token_account.to_account_info(),
            authority: self.pool.to_account_info(),
        };

        let signer_seeds: [&[&[u8]]; 1] = [&[
            POOL_SEED,
            self.mint.to_account_info().key.as_ref(),
            &[pool_bumps],
        ]];

        let ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            accounts,
            &signer_seeds,
        );

        transfer_checked(ctx, amount, self.mint.decimals)?;

        Ok(())
    }
}
