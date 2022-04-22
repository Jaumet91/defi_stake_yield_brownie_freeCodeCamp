from scripts.helpful_scripts import (
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
    INITIAL_PRICE_FEED_VALUE,
    DECIMALS,
    get_account,
    get_contract,
)
from scripts.deploy import KEPT_BALANCE, deploy_token_farm_and_dapp_token
from brownie import accounts, network, exceptions
import pytest


def test_set_price_feed_contract():
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    account = get_account()
    non_owner = get_account(index=1)
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    # Act
    price_feed_address = get_contract("eth_usd_price_feed")
    # Assert
    assert token_farm.tokenPriceFeedMapping(dapp_token.address) == price_feed_address
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.setPriceFeedContract(
            dapp_token.address, price_feed_address, {"from": non_owner}
        )


def test_stake_tokens(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    account = get_account()
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    # Act
    # From openzeppelin
    approve_tx = dapp_token.approve(
        token_farm.address, amount_staked, {"from": account}
    )
    approve_tx.wait(1)
    stake_tx = token_farm.stakeTokens(
        amount_staked, dapp_token.address, {"from": account}
    )
    stake_tx.wait(1)
    # Assert
    assert (
        token_farm.stakingBalance(dapp_token.address, account.address) == amount_staked
    )
    assert token_farm.uniqueTokensStaked(account.address) == 1
    assert token_farm.stakers(0) == account.address
    return token_farm, dapp_token  # We return so we can use in other tests


def test_issue_tokens(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)
    starting_balance = dapp_token.balanceOf(account.address)
    # Act
    issue_tx = token_farm.issueTokens({"from": account})
    issue_tx.wait(1)
    # Assert
    # we are staking 1 dapp_token == in price to 1 ETH 2,000$ (initial_value in deploy_mocks())
    # so... we should get 2,000 dapp tokens in reward
    assert (
        dapp_token.balanceOf(account.address)
        == starting_balance + INITIAL_PRICE_FEED_VALUE
    )


def test_get_user_total_value_with_different_tokens(amount_staked, random_erc20):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)
    # Act
    allow_random_token_tx = token_farm.addAllowedTokens(
        random_erc20.address, {"from": account}
    )
    allow_random_token_tx.wait(1)
    set_price_feed_tx = token_farm.setPriceFeedContract(
        random_erc20.address, get_contract("eth_usd_price_feed"), {"from": account}
    )
    set_price_feed_tx.wait(1)
    random_erc20_stake_amount = amount_staked * 2
    approve_random_tx = random_erc20.approve(
        token_farm.address, random_erc20_stake_amount, {"from": account}
    )
    approve_random_tx.wait(1)
    stake_random_tx = token_farm.stakeTokens(
        random_erc20_stake_amount, random_erc20.address, {"from": account}
    )
    stake_random_tx.wait(1)
    # Assert
    # total_value = 2,000$ DAPP + 2,000$*2 RANDOM
    total_value = token_farm.getUserTotalValue(account.address)
    assert total_value == INITIAL_PRICE_FEED_VALUE * 3


def test_get_token_value():
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    # Act / Assert
    assert token_farm.getTokenValue(dapp_token.address) == (
        INITIAL_PRICE_FEED_VALUE,
        DECIMALS,
    )


def test_unstake_tokens(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)
    # Act
    unstake_tx = token_farm.unstakeTokens(dapp_token.address, {"from": account})
    unstake_tx.wait(1)
    # Assert
    assert dapp_token.balanceOf(account.address) == KEPT_BALANCE
    assert token_farm.stakingBalance(dapp_token.address, account.address) == 0
    assert token_farm.uniqueTokensStaked(dapp_token.address) == 0


def test_add_allowed_tokens():
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    account = get_account()
    non_owner = get_account(index=1)
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    # Act
    add_token_tx = token_farm.addAllowedTokens(dapp_token.address, {"from": account})
    add_token_tx.wait(1)
    # Assert
    assert token_farm.allowedTokens(0) == dapp_token.address
    with pytest.raises(exceptions.VirtualMachineError):
        non_owner_tx = token_farm.addAllowedTokens(
            dapp_token.address, {"from": non_owner}
        )
        non_owner_tx.wait(1)
