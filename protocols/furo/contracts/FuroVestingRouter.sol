// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.10;

import './interfaces/IFuroVesting.sol';

contract FuroVestingWrapper is Multicall {
  IBentoBoxMinimal public immutable bentoBox;
  IFuroVesting public immutable furoVesting;

  // custom errors
  error InsufficientShares();

  constructor(IBentoBoxMinimal _bentoBox, IFuroVesting _furoVesting) {
    bentoBox = _bentoBox;
    furoVesting = _furoVesting;
    _bentoBox.setMasterContractApproval(address(this), address(_furoVesting), true, 0, bytes32(0), bytes32(0));
  }

  function setBentoBoxApproval(
    address user,
    bool approved,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external payable {
    bentoBox.setMasterContractApproval(user, address(this), approved, v, r, s);
  }

  function createVesting(IFuroVesting.VestParams memory vestParams, uint256 minShare)
    external
    payable
    returns (
      uint256 depositedShares,
      uint256 vestId,
      uint128 stepShares,
      uint128 cliffShares
    )
  {
    depositedShares = _depositToken(
      address(vestParams.token),
      msg.sender,
      address(this),
      vestParams.amount,
      vestParams.fromBentoBox
    );

    if (depositedShares < minShare) revert InsufficientShares();

    vestParams.fromBentoBox = true;

    (depositedShares, vestId, stepShares, cliffShares) = furoVesting.createVesting(vestParams);

    furoVesting.updateOwner(vestId, msg.sender);
  }

  function _depositToken(
    address token,
    address from,
    address to,
    uint256 amount,
    bool fromBentoBox
  ) internal returns (uint256 depositedShares) {
    if (fromBentoBox) {
      depositedShares = bentoBox.toShare(token, amount, false);
      bentoBox.transfer(token, from, to, depositedShares);
    } else {
      (, depositedShares) = bentoBox.deposit{value: token == address(0) ? amount : 0}(token, from, to, amount, 0);
    }
  }
}
