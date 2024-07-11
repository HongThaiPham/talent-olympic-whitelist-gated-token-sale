use anchor_lang::prelude::*;

declare_id!("6GDTRDdz239dGnAYYAFQAU4x7ZYP2PCuFbcVNVQt2QGV");

#[program]
pub mod talent_olympic_whitelist_gated_token_sale {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
