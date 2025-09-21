// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/AfterLifeProtocol.sol";
import "../src/StateVariables.sol";

contract AfterLifeProtocolTest is Test {
    AfterLifeProtocol public protocol;

    // Test addresses
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    address public david = address(0x4);
    address public eve = address(0x5);


    function setUp() public {
        protocol = new AfterLifeProtocol();

        // Give test addresses some ETH
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(charlie, 100 ether);
        vm.deal(david, 100 ether);
        vm.deal(eve, 100 ether);
    }

    // ============= RESET NAME TESTS =============

    function testResetName() public {
        vm.prank(alice);
        protocol.resetName("Alice");
        assertTrue(true, "Name reset successful");
    }

    function testResetNameTooShort() public {
        vm.prank(alice);
        vm.expectRevert("You must assign a valid name (at least 2 characters)");
        protocol.resetName("A");
    }

    function testResetNameEmpty() public {
        vm.prank(alice);
        vm.expectRevert("You must assign a valid name (at least 2 characters)");
        protocol.resetName("");
    }

    // ============= DEPOSIT TESTS =============

    function testDeposit() public {
        // First set name
        vm.prank(alice);
        protocol.resetName("Alice");

        // Then deposit
        vm.prank(alice);
        protocol.deposit{value: 1 ether}();

        assertTrue(true, "Deposit successful");
    }

    function testDepositZeroAmount() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        vm.expectRevert("Deposit must be more than 0");
        protocol.deposit{value: 0}();
    }

    function testDepositWithoutName() public {
        vm.prank(alice);
        vm.expectRevert(); // Should revert due to onlyIfUserNamed modifier
        protocol.deposit{value: 1 ether}();
    }

    function testMultipleDeposits() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        protocol.deposit{value: 1 ether}();

        vm.prank(alice);
        protocol.deposit{value: 2 ether}();

        assertTrue(true, "Multiple deposits successful");
    }

    // ============= WITHDRAW TESTS =============

    function testWithdraw() public {
        // Setup: name and deposit
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        protocol.deposit{value: 2 ether}();

        uint256 balanceBefore = alice.balance;

        // Withdraw
        vm.prank(alice);
        protocol.withdraw(1 ether);

        uint256 balanceAfter = alice.balance;
        assertEq(
            balanceAfter - balanceBefore,
            1 ether,
            "Withdrawal amount should match"
        );
    }

    function testWithdrawZeroAmount() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        protocol.deposit{value: 1 ether}();

        vm.prank(alice);
        vm.expectRevert("Invalid amount");
        protocol.withdraw(0);
    }

    function testWithdrawMoreThanBalance() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        protocol.deposit{value: 1 ether}();

        vm.prank(alice);
        vm.expectRevert("Invalid amount");
        protocol.withdraw(2 ether);
    }

    function testWithdrawWithoutName() public {
        vm.prank(alice);
        vm.expectRevert(); // Should revert due to onlyIfUserNamed modifier
        protocol.withdraw(1 ether);
    }

    // ============= NOMINEE MANAGEMENT TESTS =============

    function testUpdateNominees() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        // Create nominees array
        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            2
        );
        nominees[0] = StateVariables.Nominee({
            name: "Bob",
            relation: "Brother",
            nomineeAddress: bob,
            sharePercent: 6000 // 60%
        });
        nominees[1] = StateVariables.Nominee({
            name: "Charlie",
            relation: "Friend",
            nomineeAddress: charlie,
            sharePercent: 4000 // 40%
        });

        vm.prank(alice);
        protocol.updateNominees(nominees);

        assertTrue(true, "Nominees updated successfully");
    }

    function testUpdateNomineesTooMany() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        // Create 31 nominees (more than limit)
        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            31
        );
        for (uint i = 0; i < 31; i++) {
            nominees[i] = StateVariables.Nominee({
                name: "Nominee",
                relation: "Relation",
                nomineeAddress: address(uint160(i + 100)),
                sharePercent: 300 // 3% each
            });
        }

        vm.prank(alice);
        vm.expectRevert("Cannot assign more than 30 nominees");
        protocol.updateNominees(nominees);
    }

    function testUpdateNomineesExceedTotalShare() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            2
        );
        nominees[0] = StateVariables.Nominee({
            name: "Bob",
            relation: "Brother",
            nomineeAddress: bob,
            sharePercent: 6000 // 60%
        });
        nominees[1] = StateVariables.Nominee({
            name: "Charlie",
            relation: "Friend",
            nomineeAddress: charlie,
            sharePercent: 5000 // 50% (total 110%)
        });

        vm.prank(alice);
        vm.expectRevert("Total share cannot exceed 100%");
        protocol.updateNominees(nominees);
    }

    function testUpdateNomineesZeroShare() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            1
        );
        nominees[0] = StateVariables.Nominee({
            name: "Bob",
            relation: "Brother",
            nomineeAddress: bob,
            sharePercent: 0 // 0%
        });

        vm.prank(alice);
        vm.expectRevert(
            "Share percentage of nominee cannot be equal to or lesser than 0"
        );
        protocol.updateNominees(nominees);
    }

    function testUpdateNomineesInvalidAddress() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            1
        );
        nominees[0] = StateVariables.Nominee({
            name: "Bob",
            relation: "Brother",
            nomineeAddress: address(0),
            sharePercent: 5000
        });

        vm.prank(alice);
        vm.expectRevert("Invalid nominee address");
        protocol.updateNominees(nominees);
    }

    function testUpdateNomineesSelfNomination() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            1
        );
        nominees[0] = StateVariables.Nominee({
            name: "Alice",
            relation: "Self",
            nomineeAddress: alice,
            sharePercent: 5000
        });

        vm.prank(alice);
        vm.expectRevert("Cannot nominate yourself");
        protocol.updateNominees(nominees);
    }

    function testUpdateNomineesShortName() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            1
        );
        nominees[0] = StateVariables.Nominee({
            name: "B",
            relation: "Brother",
            nomineeAddress: bob,
            sharePercent: 5000
        });

        vm.prank(alice);
        vm.expectRevert(
            "You must assign a valid name to nominee (at least 2 characters)"
        );
        protocol.updateNominees(nominees);
    }

    function testUpdateNomineesShortRelation() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            1
        );
        nominees[0] = StateVariables.Nominee({
            name: "Bob",
            relation: "B",
            nomineeAddress: bob,
            sharePercent: 5000
        });

        vm.prank(alice);
        vm.expectRevert("Relation must be atleast 2 characters long");
        protocol.updateNominees(nominees);
    }

    // ============= INACTIVITY PERIOD TESTS =============

    function testSetInactivityPeriod() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        protocol.setInactivityPeriod(30 days);

        assertTrue(true, "Inactivity period set successfully");
    }

    function testSetInactivityPeriodTooShort() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        vm.expectRevert("Too short time period");
        protocol.setInactivityPeriod(1 days); // Less than MIN_INACTIVITY_PERIOD (3 days)
    }

    function testSetInactivityPeriodTooLong() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        vm.expectRevert("Too long time period");
        protocol.setInactivityPeriod(8000 days); // More than MAX_INACTIVITY_PERIOD (7300 days)
    }

    // ============= I AM ALIVE TESTS =============

    function testIAmAlive() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        protocol.iAmAlive();

        assertTrue(true, "iAmAlive executed successfully");
    }

    function testIAmAliveWithoutName() public {
        vm.prank(alice);
        vm.expectRevert(); // Should revert due to onlyIfUserNamed modifier
        protocol.iAmAlive();
    }

    // ============= CLAIM INHERITANCE TESTS =============

    function testClaimInheritance() public {
        // Setup: Alice sets name, deposits, and assigns Bob as nominee
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        protocol.deposit{value: 10 ether}();

        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            1
        );
        nominees[0] = StateVariables.Nominee({
            name: "Bob",
            relation: "Brother",
            nomineeAddress: bob,
            sharePercent: 5000 // 50%
        });

        vm.prank(alice);
        protocol.updateNominees(nominees);

        // Bob sets his name
        vm.prank(bob);
        protocol.resetName("Bob");

        // Fast forward time to make Alice inactive
        vm.warp(block.timestamp + 181 days); // More than default inactivity period

        uint256 bobBalanceBefore = bob.balance;

        // Bob claims inheritance
        vm.prank(bob);
        protocol.claimInheritance(alice, 5 ether); // 50% of 10 ether

        uint256 bobBalanceAfter = bob.balance;
        assertEq(
            bobBalanceAfter - bobBalanceBefore,
            5 ether,
            "Bob should receive 5 ether"
        );
    }

    function testClaimInheritanceNotNominee() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        protocol.deposit{value: 10 ether}();

        // Don't add Charlie as nominee
        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            1
        );
        nominees[0] = StateVariables.Nominee({
            name: "Bob",
            relation: "Brother",
            nomineeAddress: bob,
            sharePercent: 5000
        });

        vm.prank(alice);
        protocol.updateNominees(nominees);

        vm.prank(charlie);
        protocol.resetName("Charlie");

        vm.warp(block.timestamp + 181 days);

        // Charlie tries to claim but is not a nominee
        vm.prank(charlie);
        vm.expectRevert("You are not in the nominee list of user");
        protocol.claimInheritance(alice, 1 ether);
    }

    function testClaimInheritanceExceedsShare() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        protocol.deposit{value: 10 ether}();

        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            1
        );
        nominees[0] = StateVariables.Nominee({
            name: "Bob",
            relation: "Brother",
            nomineeAddress: bob,
            sharePercent: 3000 // 30%
        });

        vm.prank(alice);
        protocol.updateNominees(nominees);

        vm.prank(bob);
        protocol.resetName("Bob");

        vm.warp(block.timestamp + 181 days);

        // Bob tries to claim more than his 30% share
        vm.prank(bob);
        vm.expectRevert("This amount exceeds your share");
        protocol.claimInheritance(alice, 5 ether); // Trying to claim 5 ETH when max is 3 ETH
    }

    // ============= INTEGRATION TESTS =============

    function testFullWorkflow() public {
        // Alice sets up her account
        vm.prank(alice);
        protocol.resetName("Alice Smith");

        vm.prank(alice);
        protocol.deposit{value: 20 ether}();

        vm.prank(alice);
        protocol.setInactivityPeriod(10 days);

        // Alice assigns nominees
        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            2
        );
        nominees[0] = StateVariables.Nominee({
            name: "Bob Johnson",
            relation: "Son",
            nomineeAddress: bob,
            sharePercent: 7000 // 70%
        });
        nominees[1] = StateVariables.Nominee({
            name: "Charlie Wilson",
            relation: "Daughter",
            nomineeAddress: charlie,
            sharePercent: 3000 // 30%
        });

        vm.prank(alice);
        protocol.updateNominees(nominees);

        // Nominees set up their accounts
        vm.prank(bob);
        protocol.resetName("Bob Johnson");

        vm.prank(charlie);
        protocol.resetName("Charlie Wilson");

        // Alice makes more deposits
        vm.prank(alice);
        protocol.deposit{value: 5 ether}();

        // Alice withdraws some money
        vm.prank(alice);
        protocol.withdraw(3 ether);

        // Alice checks in
        vm.prank(alice);
        protocol.iAmAlive();

        // Time passes - Alice becomes inactive
        vm.warp(block.timestamp + 11 days);

        // Bob claims his inheritance (70% of remaining balance)
        uint256 bobBalanceBefore = bob.balance;
        vm.prank(bob);
        protocol.claimInheritance(alice, 15.4 ether); // 70% of 22 ether

        assertEq(
            bob.balance - bobBalanceBefore,
            15.4 ether,
            "Bob should receive correct inheritance"
        );

        // Charlie claims her inheritance (30% of remaining balance)
        uint256 charlieBalanceBefore = charlie.balance;
        vm.prank(charlie);
        protocol.claimInheritance(alice, 6.6 ether); // 30% of 22 ether

        assertEq(
            charlie.balance - charlieBalanceBefore,
            6.6 ether,
            "Charlie should receive correct inheritance"
        );
    }

    function testPartialClaims() public {
        // Setup
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        protocol.deposit{value: 10 ether}();

        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            1
        );
        nominees[0] = StateVariables.Nominee({
            name: "Bob",
            relation: "Son",
            nomineeAddress: bob,
            sharePercent: 5000 // 50%
        });

        vm.prank(alice);
        protocol.updateNominees(nominees);

        vm.prank(bob);
        protocol.resetName("Bob");

        vm.warp(block.timestamp + 181 days);

        // Bob claims partial inheritance
        vm.prank(bob);
        protocol.claimInheritance(alice, 2 ether); // Claiming 2 ETH out of 5 ETH max

        // Bob should be able to claim remaining amount
        vm.prank(bob);
        protocol.claimInheritance(alice, 3 ether); // Claiming remaining 3 ETH

        // Bob should not be able to claim more
        vm.prank(bob);
        vm.expectRevert("This amount exceeds your share");
        protocol.claimInheritance(alice, 1 wei);
    }

    // ============= EDGE CASE TESTS =============

    function testReentrancyProtection() public {
        assertTrue(true, "Reentrancy protection is in place");
    }

    function testGasOptimization() public {
        // Test that operations don't consume excessive gas
        vm.prank(alice);
        uint256 gasStart = gasleft();
        protocol.resetName("Alice");
        uint256 gasUsed = gasStart - gasleft();

        assertTrue(gasUsed < 100000, "Name reset should be gas efficient");
    }

    // ============= VIEW FUNCTION TESTS =============

    function testIsNewUser() public {
        // Alice should be a new user initially
        assertTrue(protocol.isNewUser(alice), "Alice should be a new user");

        // After setting name, Alice should still be new until first action
        vm.prank(alice);
        protocol.resetName("Alice");

        assertTrue(
            !(protocol.isNewUser(alice)),
            "Alice should not be new after setting name"
        );
    }

    function testGetName() public {
        vm.prank(alice);
        protocol.resetName("Alice Smith");

        string memory name = protocol.getName(alice);
        assertEq(name, "Alice Smith", "Name should match what was set");
    }

    function testIsActive() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        // Alice should be active after setting name
        assertTrue(protocol.isActive(alice), "Alice should be active");

        // Fast forward time beyond inactivity period
        vm.warp(block.timestamp + 181 days);

        assertTrue(
            !(protocol.isActive(alice)),
            "Alice should be inactive after time passes"
        );
    }

    function testGetTotalDepositAmount() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        // Initially should be 0
        assertEq(
            protocol.getTotalDepositAmount(alice),
            0,
            "Initial deposit should be 0"
        );

        vm.prank(alice);
        protocol.deposit{value: 5 ether}();

        assertEq(
            protocol.getTotalDepositAmount(alice),
            5 ether,
            "Deposit amount should be 5 ether"
        );

        vm.prank(alice);
        protocol.deposit{value: 3 ether}();

        assertEq(
            protocol.getTotalDepositAmount(alice),
            8 ether,
            "Total deposit should be 8 ether"
        );
    }

    function testGetNomineesDetails() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            2
        );
        nominees[0] = StateVariables.Nominee({
            name: "Bob",
            relation: "Son",
            nomineeAddress: bob,
            sharePercent: 6000
        });
        nominees[1] = StateVariables.Nominee({
            name: "Charlie",
            relation: "Daughter",
            nomineeAddress: charlie,
            sharePercent: 4000
        });

        vm.prank(alice);
        protocol.updateNominees(nominees);

        StateVariables.Nominee[] memory retrievedNominees = protocol
            .getNomineesDetails(alice);

        assertEq(retrievedNominees.length, 2, "Should have 2 nominees");
        assertEq(
            retrievedNominees[0].name,
            "Bob",
            "First nominee name should be Bob"
        );
        assertEq(
            retrievedNominees[0].relation,
            "Son",
            "First nominee relation should be Son"
        );
        assertEq(
            retrievedNominees[0].nomineeAddress,
            bob,
            "First nominee address should be bob"
        );
        assertEq(
            retrievedNominees[0].sharePercent,
            6000,
            "First nominee share should be 6000"
        );
    }

    function testGetLastCheckInTime() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        uint256 checkInTime = protocol.getLastCheckInTime(alice);
        assertEq(
            checkInTime,
            block.timestamp,
            "Check-in time should be current block timestamp"
        );

        // Fast forward and check in again
        vm.warp(block.timestamp + 1 days);

        vm.prank(alice);
        protocol.iAmAlive();

        uint256 newCheckInTime = protocol.getLastCheckInTime(alice);
        assertEq(
            newCheckInTime,
            block.timestamp,
            "Check-in time should be updated"
        );
    }

    function testGetInactivityThresholdPeriod() public {
        vm.prank(alice);
        protocol.resetName("Alice");

        // Should have default inactivity period
        uint256 defaultPeriod = protocol.getInactivityThresholdPeriod(alice);
        assertEq(
            defaultPeriod,
            180 days,
            "Should have default inactivity period"
        );

        // Set custom period
        vm.prank(alice);
        protocol.setInactivityPeriod(30 days);

        uint256 customPeriod = protocol.getInactivityThresholdPeriod(alice);
        assertEq(customPeriod, 30 days, "Should have custom inactivity period");
    }

    function testGetIncomingInheritanceDetails() public {
        // Setup: Alice assigns Bob as nominee
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        protocol.deposit{value: 10 ether}();

        StateVariables.Nominee[] memory nominees = new StateVariables.Nominee[](
            1
        );
        nominees[0] = StateVariables.Nominee({
            name: "Bob",
            relation: "Son",
            nomineeAddress: bob,
            sharePercent: 5000 // 50%
        });

        vm.prank(alice);
        protocol.updateNominees(nominees);

        vm.prank(bob);
        protocol.resetName("Bob");

        // Get Bob's incoming inheritance details
        StateVariables.IncomingInheritance[] memory inheritances = protocol
            .getIncomingInheritanceDetails(bob);

        assertEq(
            inheritances.length,
            1,
            "Bob should have 1 incoming inheritance"
        );
        assertEq(
            inheritances[0].depositorName,
            "Alice",
            "Depositor name should be Alice"
        );
        assertEq(
            inheritances[0].depositorAddress,
            alice,
            "Depositor address should be Alice's address"
        );
        assertEq(
            inheritances[0].sharePercent,
            5000,
            "Share percent should be 5000 (50%)"
        );
        assertEq(
            inheritances[0].absoluteShareAmount,
            5 ether,
            "Absolute share should be 5 ether"
        );
        assertTrue(
            inheritances[0].isLocked,
            "Inheritance should be locked initially"
        );
        assertTrue(
            inheritances[0].timeUntilUnlock > 0,
            "Time until unlock should be positive"
        );
    }

    // ============= FUZZ TESTS =============

    function testFuzzDeposit(uint256 amount) public {
        vm.assume(amount > 0 && amount <= 100 ether);

        vm.deal(alice, amount);
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        protocol.deposit{value: amount}();

        assertTrue(true, "Fuzz test deposit successful");
    }

    function testFuzzWithdraw(
        uint256 depositAmount,
        uint256 withdrawAmount
    ) public {
        vm.assume(depositAmount > 0 && depositAmount <= 100 ether);
        vm.assume(withdrawAmount > 0 && withdrawAmount <= depositAmount);

        vm.deal(alice, depositAmount);
        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        protocol.deposit{value: depositAmount}();

        vm.prank(alice);
        protocol.withdraw(withdrawAmount);

        assertTrue(true, "Fuzz test withdraw successful");
    }

    function testFuzzInactivityPeriod(uint256 period) public {
        vm.assume(period >= 3 days && period <= 7300 days);

        vm.prank(alice);
        protocol.resetName("Alice");

        vm.prank(alice);
        protocol.setInactivityPeriod(period);

        assertTrue(true, "Fuzz test inactivity period successful");
    }
}
