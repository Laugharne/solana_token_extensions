use anchor_lang::{
	prelude::*,
	system_program::{create_account, CreateAccount},
};

use anchor_spl::{
	associated_token::AssociatedToken,
	token_interface::{Mint, TokenAccount, TokenInterface},
};

use spl_tlv_account_resolution::{
	state::ExtraAccountMetaList,
	account::ExtraAccountMeta,
	seeds::Seed
};

use spl_transfer_hook_interface::instruction::{ExecuteInstruction, TransferHookInstruction};

declare_id!("DrWbQtYJGtsoRwzKqAbHKHKsCJJfpysudF39GBVFSxub");

#[program]
pub mod transfer_hook {

	use super::*;

	pub fn initialize_extra_account_meta_list(
		ctx: Context<InitializeExtraAccountMetaList>,
	) -> Result<()> {

		// The `addExtraAccountsToInstruction` JS helper function resolving incorrectly
		let account_metas: Vec<spl_tlv_account_resolution::account::ExtraAccountMeta> = vec![
			ExtraAccountMeta::new_with_seeds(
				&[
					Seed::Literal {
						bytes: "counter".as_bytes().to_vec(),
					},
					Seed::AccountData {

						// - `account_index: 0`: This specifies the index of the account in the account list that the seed is
						// referring to. In this case, it is referring to the account at index 0.
						account_index: 0,

						// - `data_index: 32`: This specifies the starting index within the account data where the seed should
						// start reading data from. In this case, it is starting at index 32.
						data_index   : 32,

						// - `length: 32`: This specifies the length of data that the seed should read from the specified
						// account data. In this case, it is reading 32 bytes of data.
						length       : 32
					}
				],
				false,	// is_signer
				true,	// is_payer
			)?,
		];

		// calculate account size
		let account_size: u64 = ExtraAccountMetaList::size_of(account_metas.len())? as u64;

		// calculate minimum required lamports
		let lamports: u64 = Rent::get()?.minimum_balance(account_size as usize);

		let mint: Pubkey = ctx.accounts.mint.key();
		let signer_seeds: &[&[&[u8]]] = &[&[
			b"extra-account-metas",
			&mint.as_ref(),
			&[ctx.bumps.extra_account_meta_list],
		]];

		// create ExtraAccountMetaList account
		create_account(
			CpiContext::new(
				ctx.accounts.system_program.to_account_info(),
				CreateAccount {
					from: ctx.accounts.payer.to_account_info(),
					to  : ctx.accounts.extra_account_meta_list.to_account_info(),
				},
			)
			.with_signer(signer_seeds),
			lamports,
			account_size,
			ctx.program_id,
		)?;

		// initialize ExtraAccountMetaList account with extra accounts
		ExtraAccountMetaList::init::<ExecuteInstruction>(
			&mut ctx.accounts.extra_account_meta_list.try_borrow_mut_data()?,
			&account_metas,
		)?;

		Ok(())
	}

	pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {

		if amount > 50 {
			panic!("The amount is too big {0}", amount);
		}

		if !ctx.accounts.counter_account.white_list.contains(&ctx.accounts.destination_token.key()) {
			panic!("Account not in the white list");
		}

		ctx.accounts.counter_account.count += 1;

		msg!(
			"This token has been transferred {0} times",
			ctx.accounts.counter_account.count
		);

		msg!("Hello Transfer Hook!");

		Ok(())
	}

	pub fn add_to_white_list(ctx: Context<TransferHook>, address: Pubkey) -> Result<()> {

		if !ctx.accounts.counter_account.authority.eq(&ctx.accounts.owner.key()) {
			panic!("");
		}

		ctx.accounts.counter_account.white_list.push( address);

		Ok(())
	}

	// fallback instruction handler as workaround to anchor instruction discriminator check
	pub fn fallback<'info>(
		program_id: &Pubkey,
		accounts:   &'info [AccountInfo<'info>],
		data:       &[u8],
	) -> Result<()> {

		let instruction: TransferHookInstruction = TransferHookInstruction::unpack(data)?;

		// match instruction discriminator to transfer hook interface execute instruction
		// token2022 program CPIs this instruction on token transfer
		match instruction {
			TransferHookInstruction::Execute { amount } => {
				let amount_bytes = amount.to_le_bytes();

				// invoke custom transfer hook instruction on our program
				__private::__global::transfer_hook(program_id, accounts, &amount_bytes)
			}
			_ => return Err(ProgramError::InvalidInstructionData.into()),
		}
	}
}

#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {

	#[account(mut)]
	payer: Signer<'info>,

	/// CHECK: ExtraAccountMetaList Account, must use these seeds
	#[account(
		mut,
		seeds = [b"extra-account-metas", mint.key().as_ref()],
		bump
	)]
	pub extra_account_meta_list: AccountInfo<'info>,

	pub mint:                     InterfaceAccount<'info, Mint>,
	pub token_program:            Interface<'info, TokenInterface>,
	pub associated_token_program: Program<'info, AssociatedToken>,
	pub system_program:           Program<'info, System>,

	#[account(
		init_if_needed,
		seeds = [b"counter", payer.key().as_ref()],
		bump,
		payer = payer,
		space = 16
	)]
	pub counter_account: Account<'info, CounterAccount>,
}

// Order of accounts matters for this struct.
// The first 4 accounts are the accounts required for token transfer (source, mint, destination, owner)
// Remaining accounts are the extra accounts required from the ExtraAccountMetaList account
// These accounts are provided via CPI to this program from the token2022 program
#[derive(Accounts)]
pub struct TransferHook<'info> {

	#[account(
		token::mint      = mint,
		token::authority = owner,
	)]
	pub source_token: InterfaceAccount<'info, TokenAccount>,

	pub mint: InterfaceAccount<'info, Mint>,

	#[account(
		token::mint = mint,
	)]
	pub destination_token: InterfaceAccount<'info, TokenAccount>,

	/// CHECK: source token account owner, can be SystemAccount or PDA owned by another program
	pub owner: UncheckedAccount<'info>,

	/// CHECK: ExtraAccountMetaList Account,
	#[account(
		seeds = [b"extra-account-metas", mint.key().as_ref()],
		bump
	)]
	pub extra_account_meta_list: UncheckedAccount<'info>,

	#[account(
		mut,
		seeds = [
			b"counter",
			owner.key().as_ref()
		],
		bump
	)]
	pub counter_account: Account<'info, CounterAccount>,

}

#[account]
pub struct CounterAccount {
	pub count     : u64,
	pub authority : Pubkey,
	pub white_list: Vec<Pubkey>,
}
