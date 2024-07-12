use anchor_lang::prelude::*;

use crate::errors::MyError;

#[account]
#[derive(InitSpace)]
pub struct Slot {
    pub pool: Pubkey,       // Pool account
    pub in_whitelist: bool, // Whether the user is in the whitelist or not, default is false and can be set to true by the pool owner
    pub limit_amount: u64,  // Amount of tokens the user can buy
    pub bought_amount: u64, // Amount of tokens the user has bought
}

#[event]
pub struct SlotInitiated {
    pub pool: Pubkey,
    pub author: Pubkey,
}

impl Slot {
    pub fn init(&mut self, pool: Pubkey) -> Result<()> {
        require!(self.pool == Pubkey::default(), MyError::AlreadyInitialized);

        self.pool = pool;
        self.in_whitelist = false;
        self.limit_amount = 0;
        self.bought_amount = 0;
        Ok(())
    }

    pub fn set_slot(&mut self, pool: Pubkey, in_whitelist: bool, limit_amount: u64) -> Result<()> {
        require!(self.pool == pool, MyError::Unauthorized);

        self.in_whitelist = in_whitelist;
        self.limit_amount = limit_amount;
        Ok(())
    }

    pub fn buy_token(&mut self, amount: u64) -> Result<()> {
        require!(self.in_whitelist, MyError::NotInWhitelist);
        require!(
            self.bought_amount + amount <= self.limit_amount,
            MyError::ExceedsLimit
        );

        self.bought_amount = self
            .bought_amount
            .checked_add(amount)
            .ok_or(MyError::Overflow)?;
        Ok(())
    }
}
