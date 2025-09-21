// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./StateVariables.sol";

/// @title VaultView
/// @notice Contains all view-only functions for frontend use in the AfterLifeProtocol
contract VaultView is StateVariables {
    /// @notice Checks if a user is new (has never checked in)
    /// @param user The address of the user
    /// @return True if user is new (lastCheckInTimestamp == 0), false otherwise
    function isNewUser(address user) external view returns (bool) {
        return depositors[user].lastCheckInTimestamp == 0;
    }

    /// @notice Returns the name of the depositor
    /// @param user The address of the user
    /// @return The name string of the depositor
    function getName(address user) external view returns (string memory) {
        return depositors[user].name;
    }

    /// @notice Checks if a user is active (i.e., alive)
    /// @param user The address of the user
    /// @return True if user is active, false otherwise
    function isActive(address user) external view returns (bool) {
        return
            block.timestamp <=
            depositors[user].lastCheckInTimestamp +
                depositors[user].inactivityThresholdPeriod;
    }

    /// @notice Returns the total deposit amount of a user
    /// @param user The address of the user
    /// @return The deposit amount of the user
    function getTotalDepositAmount(
        address user
    ) external view returns (uint256) {
        return depositors[user].depositBalance;
    }

    /// @notice Returns the list of nominees for a user
    /// @param user The address of the user
    /// @return Array of nominees with name, relation, address, and sharePercent
    function getNomineesDetails(
        address user
    ) external view returns (Nominee[] memory) {
        return depositors[user].nominees;
    }

    /// @notice Returns the last check-in time of a user
    /// @param user The address of the user
    /// @return Timestamp of the last check-in
    function getLastCheckInTime(address user) external view returns (uint256) {
        return depositors[user].lastCheckInTimestamp;
    }

    /// @notice Returns the inactivity threshold time of a user
    /// @param user The address of the user
    /// @return The inactivity threshold duration in seconds
    function getInactivityThresholdPeriod(
        address user
    ) external view returns (uint256) {
        return depositors[user].inactivityThresholdPeriod;
    }

    /// @notice Returns a list of incoming inheritances for a given nominee
    /// @param nominee The address of the nominee
    /// @return Array of IncomingInheritance structs
    function getIncomingInheritanceDetails(
        address nominee
    ) external view returns (IncomingInheritance[] memory) {
        address[] storage depositorsList = inheritanceFrom[nominee].depositors;
        IncomingInheritance[] memory inheritances = new IncomingInheritance[](
            depositorsList.length
        );

        for (uint256 i = 0; i < depositorsList.length; i++) {
            address depositorAddr = depositorsList[i];
            Depositor storage depositor = depositors[depositorAddr];
            uint256 index = depositor.nomineeIndex[nominee];
            Nominee storage nomineeData = depositor.nominees[index];

            bool isLocked = block.timestamp <=
                depositor.lastCheckInTimestamp +
                    depositor.inactivityThresholdPeriod;
            uint256 timeUntilUnlock = isLocked
                ? depositor.lastCheckInTimestamp +
                    depositor.inactivityThresholdPeriod -
                    block.timestamp
                : 0;
            uint256 absoluteShareAmount = (depositor
                .lastDepositBeforeNomineesWereAllowedToWithdraw *
                nomineeData.sharePercent) / 10000;

            inheritances[i] = IncomingInheritance({
                depositorName: depositor.name,
                depositorAddress: depositorAddr,
                sharePercent: nomineeData.sharePercent,
                absoluteShareAmount: absoluteShareAmount,
                inactivityThresholdPeriod: depositor.inactivityThresholdPeriod,
                timeUntilUnlock: timeUntilUnlock,
                isLocked: isLocked
            });
        }

        return inheritances;
    }
}
