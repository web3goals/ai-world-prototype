// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/interfaces/IAccount.sol";
// import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Account is IAccount {
    uint256 public count;
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256
    ) external view returns (uint256 validationData) {
        // address recovered = ECDSA.recover(
        //     ECDSA.toEthSignedMessageHash(userOpHash),
        //     userOp.signature
        // );

        // return owner == recovered ? 0 : 1;

        return 0;
    }

    // function execute() external {
    //     count++;
    // }

    /**
     * execute a transaction (called directly from owner, or by entryPoint)
     */
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external {
        // _requireFromEntryPointOrOwner();
        _call(dest, value, func);
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }
}
