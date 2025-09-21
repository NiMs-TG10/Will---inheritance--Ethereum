// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./VaultView.sol";
import "./VaultActions.sol";

/**
 * @title AfterLifeProtocol
 * @dev Core contract that inherits all functionality from VaultView and VaultActions.
 *      This contract serves as the main interface for depositors to interact with the protocol.
 */
contract AfterLifeProtocol is VaultView, VaultActions {
    /**
     * @dev Constructor initializes the AfterLifeProtocol contract.
     */
    constructor() {}
}
