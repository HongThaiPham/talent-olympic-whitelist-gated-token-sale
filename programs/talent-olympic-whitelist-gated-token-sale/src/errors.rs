use anchor_lang::prelude::*;
#[error_code]
pub enum MyError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Already initialized")]
    AlreadyInitialized,
    #[msg("Cannot close pool")]
    CannotClosePool,
    Overflow,
    InvalidTimeRange,
    InvalidPrice,
    NotInWhitelist,
    ExceedsLimit,
    InvalidAmount,
    CannotBuyThisTime,
    PoolCannotBuy,
}
