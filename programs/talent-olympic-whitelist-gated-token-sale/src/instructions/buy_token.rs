use anchor_lang::{
    prelude::*,
    system_program::{self, Transfer},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{
    constants::{POOL_SEED, SLOT_SEED, TREASURY_SEED},
    errors::MyError,
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
    /// CHECK: keeper
    #[account(
      mut,
      seeds = [TREASURY_SEED, pool.key().as_ref(), pool.author.as_ref()],
      bump,
    )]
    pub pool_treasury: AccountInfo<'info>,
    #[account(
      mut,
      seeds = [SLOT_SEED, pool.key().as_ref(), signer.key().as_ref()],
      bump
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
        require!(self.pool.can_buy, MyError::PoolCannotBuy);
        self.slot.buy_token(amount)?;
        // for simple case, we can just transfer the SOL from user to treasury immediately after the user buys the token
        self.transfer_sol_to_traesury(amount)?;
        // for simple case, we can just transfer the token from pool to user immediately after the user buys the token
        self.transfer_token_from_pool_to_user(amount, bumps.pool)?;

        if self.slot.bought_amount == self.slot.limit_amount {
            self.slot.close(self.signer.to_account_info())?;
        }
        Ok(())
    }

    fn transfer_sol_to_traesury(&mut self, amount: u64) -> Result<()> {
        let lamports = self.pool.calculate_sol_amount(amount)?;
        require!(lamports.gt(&0), MyError::InvalidAmount);
        let accounts = Transfer {
            from: self.signer.to_account_info(),
            to: self.pool_treasury.clone(),
        };
        let ctx = CpiContext::new(self.system_program.to_account_info(), accounts);
        system_program::transfer(ctx, lamports)?;
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
