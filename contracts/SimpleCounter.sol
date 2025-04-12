// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleCounter {
    uint256 private _count;
    
    event CounterIncremented(address indexed user, uint256 newCount);
    event CounterDecremented(address indexed user, uint256 newCount);
    event CounterReset(address indexed user);
    
    constructor() {
        _count = 0;
    }
    
    function getCount() public view returns (uint256) {
        return _count;
    }
    
    function increment() public {
        _count += 1;
        emit CounterIncremented(msg.sender, _count);
    }
    
    function decrement() public {
        require(_count > 0, "Counter cannot be negative");
        _count -= 1;
        emit CounterDecremented(msg.sender, _count);
    }
    
    function reset() public {
        _count = 0;
        emit CounterReset(msg.sender);
    }
}