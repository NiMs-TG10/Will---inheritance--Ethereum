// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./StateVariables.sol";

/// @title Modifiers for Access Control and Activity Checks
/// @notice Provides custom modifiers to restrict function usage based on activity status or name presence
contract Modifiers is StateVariables {
    /// @notice Modifier to allow actions only if the user is active or a new user
    /// @dev If user is new (lastCheckInTimestamp == 0), sets inactivityThresholdPeriod but does not update lastCheckInTimestamp
    modifier onlyIfActive() {
        Depositor storage user = depositors[msg.sender];
        bool isActive = false;

        // below we check if user is a new user or not
        // if lastCheckInTimestamp is 0, then for sure user is a new user. Hence setting some basic things
        if (user.lastCheckInTimestamp == 0) {
            user.inactivityThresholdPeriod = BY_DEFAULT_INACTIVITY_PERIOD;
            // we are not setting lastCheckInTimestamp here bcoz we will do it at the end of the function on which this modifier is applied
            isActive = true;
        } else {
            uint256 timePassed = block.timestamp - user.lastCheckInTimestamp;
            if (timePassed <= user.inactivityThresholdPeriod) {
                isActive = true;
            }
        }
        require(isActive, "You are inactive; you cannot perform this action");
        _;
    }

    /// @notice Modifier to allow actions only if the user has set their name
    /// @dev Prevents usage if `user.name` is an empty string
    modifier onlyIfUserNamed() {
        Depositor storage user = depositors[msg.sender];
        require(
            bytes(user.name).length > 0,
            "User must set his/her name first"
        );
        _;
    }
}
