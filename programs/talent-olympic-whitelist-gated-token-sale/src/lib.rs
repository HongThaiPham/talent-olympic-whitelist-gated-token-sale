use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
use instructions::*;
pub mod state;

declare_id!("6GDTRDdz239dGnAYYAFQAU4x7ZYP2PCuFbcVNVQt2QGV");

#[program]
pub mod talent_olympic_whitelist_gated_token_sale {

    use super::*;

    pub fn init_a_pool(
        ctx: Context<InitializePool>,
        allocation: u64,
        price: u64,
        start_time: i64,
        end_time: i64,
        reference_id: Option<u64>,
    ) -> Result<()> {
        ctx.accounts
            .handler(allocation, price, start_time, end_time, reference_id)
    }

    pub fn close_pool(ctx: Context<ClosePool>) -> Result<()> {
        ctx.accounts.handler()
    }

    pub fn approve_buy(ctx: Context<ApproveBuy>) -> Result<()> {
        ctx.accounts.handler()
    }

    pub fn set_slot(
        ctx: Context<SetSlot>,
        wallet: Pubkey,
        in_whitelist: bool,
        limit_amount: u64,
    ) -> Result<()> {
        ctx.accounts.handler(wallet, in_whitelist, limit_amount)
    }

    pub fn join_whitelist(ctx: Context<JoinWhitelist>) -> Result<()> {
        ctx.accounts.handler()
    }

    pub fn leave_whitelist(ctx: Context<LeaveWhitelist>) -> Result<()> {
        ctx.accounts.handler()
    }

    pub fn buy_token(ctx: Context<BuyToken>, amount: u64) -> Result<()> {
        ctx.accounts.handler(amount, ctx.bumps)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
