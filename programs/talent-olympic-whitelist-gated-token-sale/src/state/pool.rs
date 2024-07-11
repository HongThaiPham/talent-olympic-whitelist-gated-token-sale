use anchor_lang::prelude::*;

use crate::errors::MyError;

#[account]
#[derive(InitSpace)]
pub struct Pool {
    pub is_initialized: bool,      // Whether the pool is initialized or not
    pub author: Pubkey,            // The author of the pool
    pub mint: Pubkey,              // Token mint of the pool
    pub allocation: u64,           // The allocation of the pool
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
    pub start_time: i64,
    pub end_time: i64,
    pub reference_id: Option<u64>,
}

#[event]
pub struct PoolClosed {
    pub pool: Pubkey,
    pub author: Pubkey,
    pub mint: Pubkey,
}

impl Pool {
    pub fn init(
        &mut self,
        author: Pubkey,
        mint: Pubkey,
        allocation: u64,
        start_time: i64,
        end_time: i64,
        reference_id: Option<u64>,
    ) -> Result<()> {
        require!(!self.is_initialized, MyError::AlreadyInitialized);
        self.is_initialized = true;
        // self.reference_id = reference_id;
        self.author = author;
        self.mint = mint;
        self.allocation = allocation;
        self.start_time = start_time;
        self.end_time = end_time;
        self.can_buy = false;
        self.reference_id = reference_id;
        self.candidate_count = 0;
        Ok(())
    }
}
