// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import "./Window.sol";
import "./WeeklyWindow.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

/**
 * @title WindowFactory
 * @author Obsidian
 * @notice Clones and tracks the round and weekly windows the system runs through.
 * @dev Windows are EIP-1167 minimal proxies rather than full deployments. A round window
 *      is created every 12 hours and a weekly one every fourteen rounds, so deploying the
 *      full contract each time would cost more in gas than the whole rest of a settlement.
 *
 *      Cloning is deterministic, and every clone is recorded in {windowIsVerified} in the
 *      same call that creates it. That mapping is the access check behind every payout
 *      path in the system, so a window that this factory did not create can never reach
 *      the ledger.
 */
abstract contract WindowFactory {
    // Custom error definitions for the contract
    /**
     * @notice Thrown when an address argument is the zero address.
     * @dev Throws if an address is invalid (e.g., address(0)).
     */
    error InvalidAddress();
    /**
     * @notice Thrown when the caller is not the window running the current round.
     * @dev Throws if a function is called by an address that is not the `latestWindow`.
     */
    error OnlyLatestWindow();
    /**
     * @notice Thrown when the caller is not a window this factory created.
     * @dev Throws if a function is called by an address that is not a verified operational window.
     */
    error OnlyVerifiedWindow();

    /**
     * @notice The address of the most recently created operational window.
     */
    address public latestWindow;
    /**
     * @notice The address of the SmartContractWindow implementation contract used for cloning.
     */
    address public implementation;
    /**
     * @notice The WeeklyWindow implementation used for cloning one window per week.
     */
    address public weeklyImplementation;
    /**
     * @notice The weekly window currently collecting — the destination for the weekly
     *         share of every join and top-up.
     */
    address public weeklyWindow;

    /**
     * @notice Mapping from round ID to the address of its corresponding operational window.
     */
    mapping(uint256 round => address window) public roundToWindow;
    /**
     * @notice Mapping to verify if a given address is a legitimate operational window created by this factory.
     */
    mapping(address window => bool verified) public windowIsVerified;
    /**
     * @notice Mapping from week to the window that collected and paid it out.
     */
    mapping(uint256 week => address window) public weekToWindow;

    /**
     * @notice Event emitted when a new operational window is created.
     * @param window The address of the newly created window contract.
     * @param salt The salt used for deterministic cloning.
     */
    event WindowCreated(address indexed window, bytes32 salt);
    /**
     * @notice Event emitted when the `latestWindow` address is updated.
     * @param oldWindow The address of the previous latest window.
     * @param newWindow The address of the new latest window.
     */
    event LatestWindowChanged(
        address indexed oldWindow,
        address indexed newWindow
    );
    /**
     * @notice Event emitted when a new weekly window is created.
     * @param window The address of the new weekly window.
     * @param week The week it collects for.
     */
    event WeeklyWindowCreated(address indexed window, uint256 indexed week);

    /**
     * @notice Restricts a function to the window running the current round.
     * @dev Reverts with {OnlyLatestWindow} otherwise. This is what stops a closed window
     *      from taking entries or moving the ledger after its round has settled.
     */
    modifier onlyLatestWindow() {
        if (msg.sender != getLatestWindow()) revert OnlyLatestWindow();
        _;
    }

    /**
     * @notice Restricts a function to any window this factory created.
     * @dev Reverts with {OnlyVerifiedWindow} otherwise. Wider than {onlyLatestWindow}
     *      because a past round still has to be able to pay itself out.
     */
    modifier onlyVerifiedWindow() {
        if (!windowIsVerified[msg.sender]) revert OnlyVerifiedWindow();
        _;
    }

    /**
     * @notice Constructor to initialize the WindowFactory.
     * @dev Takes the two clone templates rather than deploying them.
     *
     *      They used to be built here with `new`, which embedded both of their creation
     *      codes in this contract's own initcode — 23.5KB of the 45,987 bytes the deploy
     *      carried, against an EIP-3860 limit of 49,152. Nothing sizeable could be added
     *      to the system without the deploy being rejected outright. Deploying the two
     *      implementations first and passing their addresses in drops the initcode to
     *      about 22KB and leaves runtime size (EIP-170) as the only limit that binds.
     *
     *      The implementations cannot be given this address at their own construction —
     *      they are deployed before it exists — so they take it in their `init`, from
     *      the factory that clones them.
     * @param windowImpl The `SmartContractWindow` implementation to clone per round.
     * @param weeklyImpl The `WeeklyWindow` implementation to clone per week.
     */
    constructor(address windowImpl, address weeklyImpl) {
        if (windowImpl == address(0) || weeklyImpl == address(0)) {
            revert InvalidAddress();
        }
        implementation = windowImpl;
        weeklyImplementation = weeklyImpl;
    }

    /**
     * @notice Creates the window that collects for a given week.
     * @dev Weeks with no activity never get one, which is why {weekToWindow} is checked
     *      before any distribution rather than assumed.
     * @param week The week to open.
     * @return window The address of the new weekly window.
     */
    function createWeeklyWindow(
        uint256 week
    ) internal returns (address payable window) {
        // abi.encode, not encodePacked: every field is padded to 32 bytes, so no two
        // different (week, window) pairs can ever flatten to the same preimage.
        bytes32 salt = keccak256(abi.encode("week", week, weeklyWindow));
        window = payable(Clones.cloneDeterministic(weeklyImplementation, salt));
        weeklyWindow = window;
        weekToWindow[week] = window;
        windowIsVerified[window] = true;
        WeeklyWindow(window).init(week);
        emit WeeklyWindowCreated(window, week);
    }

    /**
     * @notice Retrieves the `stabilizedPointValue` from a specific operational window.
     * @param round The ID of the round to query.
     * @return The `stabilizedPointValue` of the specified round's window, or 0 if the window does not exist.
     * @dev Reads the figure off that round's own window rather than recomputing it, so a
     *      round that closed weeks ago reports the terms it actually settled at.
     */
    function getRoundPointValue(uint256 round) external view returns (uint256) {
        address window = roundToWindow[round];
        if (window == address(0)) return (0);
        return SmartContractWindow(payable(window)).stabilizedPointValue();
    }

    /**
     * @notice Returns the address of the most recently created operational window.
     * @dev A function rather than the raw public getter because {onlyLatestWindow} reads
     *      it on every guarded call, and the windows read it back over the interface.
     * @return The address of the `latestWindow`.
     */
    function getLatestWindow() public view returns (address) {
        return latestWindow;
    }

    /**
     * @notice Creates and initializes a new operational window for a given round.
     *         Uses CREATE2 to deploy the window deterministically.
     * @param roundId The ID for the new operational round.
     * @param stage The pool stage this round runs under, recorded on the window.
     * @return window The address of the newly created SmartContractWindow contract.
     * @dev Clones and initializes in the same call, so a window is never observable
     *      unbound, and records it in {windowIsVerified} before anything can call it.
     */
    function createWindow(
        uint256 roundId,
        uint8 stage
    ) internal returns (address payable window) {
        // `latestWindow` alone already makes this unique per round; the other two are
        // entropy. abi.encode for the same reason as in {createWeeklyWindow}.
        //
        // Spelled `block.difficulty` rather than `block.prevrandao` deliberately: under
        // the `london` EVM target this build uses, the newer name compiles to the very
        // same DIFFICULTY opcode and only earns a compiler warning for it.
        bytes32 salt = keccak256(
            abi.encode(msg.sender, block.difficulty, latestWindow)
        );
        address oldWindow = latestWindow;
        window = payable(Clones.cloneDeterministic(implementation, salt));
        latestWindow = window;
        roundToWindow[roundId] = window;
        windowIsVerified[window] = true;
        SmartContractWindow(window).init(roundId, stage);
        emit WindowCreated(window, salt);
        emit LatestWindowChanged(oldWindow, window);
    }
}
