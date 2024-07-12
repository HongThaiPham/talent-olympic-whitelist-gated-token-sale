use anchor_lang::{prelude::*, solana_program::native_token::LAMPORTS_PER_SOL};

use crate::errors::MyError;

#[account]
#[derive(InitSpace)]
pub struct Pool {
    pub is_initialized: bool,      // Whether the pool is initialized or not
    pub author: Pubkey,            // The author of the pool
    pub mint: Pubkey,              // Token mint of the pool
    pub allocation: u64,           // The allocation of the pool
    pub price: u64,                // The price per token of the pool
    pub start_time: i64,           // The start date of the pool
    pub end_time: i64,             // The end date of the pool
    pub can_buy: bool,             // Whether the pool is open for buying or not
    pub reference_id: Option<u64>, // The reference id of the pool map to off-chain db for track
    pub candidate_count: u64,      // The number of candidates in the pool
}

#[event]
pub struct NewPoolInitiated {
    pub author: Pubkey,
    pub mint: Pubkey,
    pub allocation: u64,
    pub price: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub reference_id: Option<u64>,
}

#[event]
pub struct PoolClosed {
    pub pool: Pubkey,
    pub author: Pubkey,
    pub mint: Pubkey,
    pub allocation: u64,
    pub price: u64,
}

impl Pool {
    pub fn init(
        &mut self,
        author: Pubkey,
        mint: Pubkey,
        allocation: u64,
        price: u64,
        start_time: i64,
        end_time: i64,
        reference_id: Option<u64>,
    ) -> Result<()> {
        require!(!self.is_initialized, MyError::AlreadyInitialized);
        require!(start_time < end_time, MyError::InvalidTimeRange);
        require!(price > 0, MyError::InvalidPrice);

        self.is_initialized = true;
        self.author = author;
        self.mint = mint;
        self.allocation = allocation;
        self.price = price;
        self.start_time = start_time;
        self.end_time = end_time;
        self.can_buy = false;
        self.reference_id = reference_id;
        self.candidate_count = 0;
        Ok(())
    }

    pub fn increase_candidate_count(&mut self) -> Result<()> {
        self.candidate_count = self
            .candidate_count
            .checked_add(1)
            .ok_or(MyError::Overflow)?;
        Ok(())
    }

    pub fn decrease_candidate_count(&mut self) -> Result<()> {
        self.candidate_count = self
            .candidate_count
            .checked_sub(1)
            .ok_or(MyError::Overflow)?;
        Ok(())
    }

    pub fn approve_buy(&mut self, user: Pubkey) -> Result<()> {
        require!(self.author == user, MyError::Unauthorized);
        self.can_buy = true;
        Ok(())
    }

    pub fn calculate_sol_amount(&self, amount: u64) -> Result<u64> {
        let temp = amount.checked_mul(self.price).ok_or(MyError::Overflow)?;
        Ok(temp
            .checked_div(LAMPORTS_PER_SOL)
            .ok_or(MyError::Overflow)?)
    }
}
