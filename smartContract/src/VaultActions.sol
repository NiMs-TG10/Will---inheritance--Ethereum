// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./StateVariables.sol";
import "./Modifiers.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VaultActions is ReentrancyGuard, StateVariables, Modifiers {
    // ------Reset name--------
    function resetName(string calldata newName) external onlyIfActive {
        require(
            bytes(newName).length >= 2,
            "You must assign a valid name (at least 2 characters)"
        );
        Depositor storage user = depositors[msg.sender];
        user.name = newName;
        user.lastCheckInTimestamp = block.timestamp;
    }

    // -------- Deposit and Withdraw --------
    function deposit() external payable onlyIfActive onlyIfUserNamed {
        Depositor storage user = depositors[msg.sender];
        require(msg.value > 0, "Deposit must be more than 0");
        user.depositBalance += msg.value;
        user.lastDepositBeforeNomineesWereAllowedToWithdraw += msg.value;
        user.lastCheckInTimestamp = block.timestamp;
    }

    function withdraw(
        uint256 amount
    ) external nonReentrant onlyIfActive onlyIfUserNamed {
        Depositor storage user = depositors[msg.sender];
        require(amount > 0 && amount <= user.depositBalance, "Invalid amount");

        user.depositBalance -= amount;
        user.lastDepositBeforeNomineesWereAllowedToWithdraw -= amount;
        user.lastCheckInTimestamp = block.timestamp;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }

    // -------- Nominee Management --------
    function updateNominees(
        Nominee[] calldata newNominees
    ) external onlyIfActive onlyIfUserNamed {
        Depositor storage user = depositors[msg.sender];

        require(
            newNominees.length <= 30,
            "Cannot assign more than 30 nominees"
        );

        uint256 totalSharePercent = 0;

        for (uint256 i = 0; i < newNominees.length; i++) {
            require(
                bytes(newNominees[i].name).length >= 2,
                "You must assign a valid name to nominee (at least 2 characters)"
            );
            require(
                bytes(newNominees[i].relation).length >= 2,
                "Relation must be atleast 2 characters long"
            );
            require(
                newNominees[i].nomineeAddress != address(0),
                "Invalid nominee address"
            );
            require(
                newNominees[i].nomineeAddress != msg.sender,
                "Cannot nominate yourself"
            );
            require(
                newNominees[i].sharePercent > 0,
                "Share percentage of nominee cannot be equal to or lesser than 0"
            );
            totalSharePercent += newNominees[i].sharePercent;
        }

        require(totalSharePercent <= 10000, "Total share cannot exceed 100%");

        // Remove old nominees
        for (uint256 i = 0; i < user.nominees.length; i++) {
            address oldNominee = user.nominees[i].nomineeAddress;

            IncomingInheritanceSources storage sources = inheritanceFrom[
                oldNominee
            ];
            uint256 index = sources.depositorIndex[msg.sender];
            uint256 lastIndex = sources.depositors.length - 1;

            if (index < lastIndex) {
                address lastAddress = sources.depositors[lastIndex];
                sources.depositors[index] = lastAddress;
                sources.depositorIndex[lastAddress] = index;
            }

            sources.depositors.pop();
            delete sources.depositorIndex[msg.sender];
        }

        delete user.nominees;

        // Add new nominees
        for (uint256 i = 0; i < newNominees.length; i++) {
            Nominee memory nominee = newNominees[i];
            user.nominees.push(nominee);
            user.nomineeIndex[nominee.nomineeAddress] = i;

            IncomingInheritanceSources storage sources = inheritanceFrom[
                nominee.nomineeAddress
            ];
            sources.depositorIndex[msg.sender] = sources.depositors.length;
            sources.depositors.push(msg.sender);
        }
        user.lastCheckInTimestamp = block.timestamp;
    }

    // ----set inactivityThresholdPeriod for the user-------------------
    function setInactivityPeriod(
        uint256 timeInSeconds
    ) external onlyIfActive onlyIfUserNamed {
        require(
            timeInSeconds >= MIN_INACTIVITY_PERIOD,
            "Too short time period"
        );

        require(timeInSeconds <= MAX_INACTIVITY_PERIOD, "Too long time period");

        Depositor storage user = depositors[msg.sender];

        user.inactivityThresholdPeriod = timeInSeconds;
        user.lastCheckInTimestamp = block.timestamp;
    }

    // --------this function just lets the contract know that the user is alive---------
    function iAmAlive() external onlyIfActive onlyIfUserNamed {
        Depositor storage user = depositors[msg.sender];
        user.lastCheckInTimestamp = block.timestamp;
    }

    // -------- Claim by Nominee --------
    function claimInheritance(
        address fromUser,
        uint256 amount
    ) external nonReentrant onlyIfUserNamed {
        Depositor storage user = depositors[fromUser];

        require(
            block.timestamp >
                user.lastCheckInTimestamp + user.inactivityThresholdPeriod,
            "User is still active"
        );

        uint256 nomineeIdx = user.nomineeIndex[msg.sender];
        Nominee storage nominee = user.nominees[nomineeIdx];

        require(
            nominee.nomineeAddress == msg.sender,
            "You are not in the nominee list of user"
        );

        uint256 maxAmount = (nominee.sharePercent *
            user.lastDepositBeforeNomineesWereAllowedToWithdraw) / 10000;

        require(amount <= maxAmount, "This amount exceeds your share");

        uint256 remainingAmount = maxAmount - amount;
        uint256 newSharePercent = (remainingAmount * 10000) /
            user.lastDepositBeforeNomineesWereAllowedToWithdraw;

        nominee.sharePercent = newSharePercent;
        user.depositBalance -= amount;

        if (newSharePercent == 0) {
            IncomingInheritanceSources storage sources = inheritanceFrom[
                msg.sender
            ];
            uint256 index = sources.depositorIndex[fromUser];
            uint256 lastIndex = sources.depositors.length - 1;

            if (index < lastIndex) {
                address lastAddr = sources.depositors[lastIndex];
                sources.depositors[index] = lastAddr;
                sources.depositorIndex[lastAddr] = index;
            }

            sources.depositors.pop();
            delete sources.depositorIndex[fromUser];
        }

        if (
            block.timestamp <=
            depositors[msg.sender].lastCheckInTimestamp +
                depositors[msg.sender].inactivityThresholdPeriod
        ) {
            depositors[msg.sender].lastCheckInTimestamp = block.timestamp;
        }

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }
}
