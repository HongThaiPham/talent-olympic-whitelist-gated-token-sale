use anchor_lang::prelude::*;
#[error_code]
pub enum MyError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Already initialized")]
    AlreadyInitialized,
}
