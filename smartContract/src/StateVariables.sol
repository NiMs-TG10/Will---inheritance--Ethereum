// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title State Variables for Inheritance and Nominee System
/// @notice Defines core data structures and storage mappings for managing deposits, nominees, and inheritance logic
contract StateVariables {
    /// @notice Represents a nominee who will inherit a portion of the depositor’s funds
    /// @dev Share percent is in 4-digit precision (e.g., 2500 = 25.00%)
    struct Nominee {
        string name;
        string relation;
        address nomineeAddress;
        uint256 sharePercent; // in 4-digit precision (e.g. 2500 for 25.00%)
        // anywhere we use this sharepercent in calculations, we divide/multiply by 10000 instead of 100
    }

    /// @notice Represents a person who has deposited funds and assigned nominees
    /// @dev lastCheckInTimestamp is used to determine if a user is new (0 if new)
    struct Depositor {
        string name;
        uint256 depositBalance;
        uint256 lastDepositBeforeNomineesWereAllowedToWithdraw; // the last balance before depositor became inactive
        uint256 lastCheckInTimestamp; // last time depositor confirmed they are alive
        uint256 inactivityThresholdPeriod; // duration of inactivity after which nominees can claim
        Nominee[] nominees; // list of nominees for this depositor
        mapping(address => uint256) nomineeIndex; // quick lookup for nominee index in the array
    }

    /// @notice Represents inheritance a user is receiving from another depositor
    /// @dev Used in getter functions to show details of incoming inheritance to the frontend
    struct IncomingInheritance {
        string depositorName; // name of the person who made you a nominee
        address depositorAddress;
        uint256 sharePercent; // in 4-digit precision (e.g. 2500 = 25.00%)
        uint256 absoluteShareAmount; // your claimable amount = (share % * eligible deposit) / 10000
        uint256 inactivityThresholdPeriod; // threshold after which you can claim
        uint256 timeUntilUnlock; // time left before your claim unlocks
        bool isLocked; // true = cannot claim yet, false = claimable
    }

    /// @notice Tracks who has listed this user as their nominee
    /// @dev Provides fast lookup of depositors who have made a given user their nominee
    struct IncomingInheritanceSources {
        address[] depositors; // people who have listed this user as nominee
        mapping(address => uint256) depositorIndex; // mapping for quick lookup
    }

    /// @notice Mapping from user address to their depositor profile
    mapping(address => Depositor) internal depositors;

    /// @notice Mapping from user address to inheritance sources (people who made them a nominee)
    mapping(address => IncomingInheritanceSources) internal inheritanceFrom;

    /// @notice Bydefault inactivity duration after which nominees can claim.
    /// @dev Set to 180 days
    uint256 internal constant BY_DEFAULT_INACTIVITY_PERIOD = 180 days;

    /// @notice Minimum inactivity period required before nominees can claim
    /// @dev Set to 3 days
    uint256 internal constant MIN_INACTIVITY_PERIOD = 3 days;

    /// @notice Maximum user inactivity duration after which nominees can claim.
    /// @dev Set to 7300 days
    uint256 internal constant MAX_INACTIVITY_PERIOD = 7300 days;
}
