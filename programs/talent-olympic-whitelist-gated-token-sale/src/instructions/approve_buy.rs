use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{
    constants::{POOL_SEED, TREASURY_SEED},
    errors::MyError,
    state::Pool,
};

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
    /// CHECK: keeper
    #[account(
        mut,
        seeds = [TREASURY_SEED, pool.key().as_ref(), pool.author.as_ref()],
        bump,
    )]
    pub pool_treasury: AccountInfo<'info>,
    #[account(
        address = pool.mint,
        mint::token_program = token_program,
    )]
    pub mint: Box<InterfaceAccount<'info, Mint>>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
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

impl<'info> ApproveBuy<'info> {
    pub fn handler(&mut self) -> Result<()> {
        self.pool.approve_buy(self.signer.key())?;
        self.transfer_token_to_pool()?;
        Ok(())
    }

    fn transfer_token_to_pool(&mut self) -> Result<()> {
        let accounts = TransferChecked {
            from: self.signer_token_account.to_account_info(),
            mint: self.mint.to_account_info(),
            to: self.pool_token_account.to_account_info(),
            authority: self.signer.to_account_info(),
        };
        let ctx = CpiContext::new(self.token_program.to_account_info(), accounts);

        transfer_checked(ctx, self.pool.allocation, self.mint.decimals)?;

        Ok(())
    }
}
