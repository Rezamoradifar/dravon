Obsidian v7.4 — all contracts (SmartContract, SmartContractWindow, WeeklyWindow)

  SmartContract        0x344438c4d038Ccd30104a64FF51DD07AC223795E
  SmartContractWindow  0xaF1feFb042dc3DfF223eB2160A600853096D74B8
  WeeklyWindow         0x71947a4468B9Dcb78c91AD45A5D95492cDD78E7b

Entry point:  contracts/SmartContract.sol
Sources:      28 files, 8813 lines

Compiler settings to select when scanning:
  solc version    0.8.36
  optimizer       enabled, 500 runs
  via IR          true
  EVM version     london

This archive is the transitive import closure of the entry point and nothing
else. Test mocks, harnesses and contracts deployed separately are deliberately
absent: they are not part of this contract and including them attributes their
findings to it.

Files:
  @openzeppelin/contracts/interfaces/IERC1363.sol
  @openzeppelin/contracts/interfaces/IERC165.sol
  @openzeppelin/contracts/interfaces/IERC20.sol
  @openzeppelin/contracts/proxy/Clones.sol
  @openzeppelin/contracts/token/ERC20/IERC20.sol
  @openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol
  @openzeppelin/contracts/utils/Create2.sol
  @openzeppelin/contracts/utils/Errors.sol
  @openzeppelin/contracts/utils/introspection/IERC165.sol
  @openzeppelin/contracts/utils/math/Math.sol
  @openzeppelin/contracts/utils/math/SafeCast.sol
  @openzeppelin/contracts/utils/math/SignedMath.sol
  @openzeppelin/contracts/utils/Panic.sol
  @openzeppelin/contracts/utils/ReentrancyGuard.sol
  @openzeppelin/contracts/utils/Strings.sol
  contracts/DataStorage.sol
  contracts/interfaces/IContractProvider.sol
  contracts/interfaces/ISmartContract.sol
  contracts/interfaces/IWindowFactory.sol
  contracts/SmartContract.sol
  contracts/Swapper.sol
  contracts/utils/IPancakeV3Router.sol
  contracts/utils/IWERC20.sol
  contracts/utils/NativeTransfer.sol
  contracts/utils/UintToFloatString.sol
  contracts/WeeklyWindow.sol
  contracts/Window.sol
  contracts/WindowFactory.sol
