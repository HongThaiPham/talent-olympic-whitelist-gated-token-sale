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
        start_time: i64,
        end_time: i64,
        reference_id: Option<u64>,
    ) -> Result<()> {
        ctx.accounts
            .init(allocation, start_time, end_time, reference_id)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
