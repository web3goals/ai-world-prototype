// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @notice A contract that stores AI apps and users.
 */
contract AIApp is ERC721URIStorage, ERC721Holder {
    struct Params {
        uint cost;
        address token;
        uint balance;
        uint revenue;
        uint created;
    }

    uint private _nextTokenId;
    mapping(uint tokenId => Params params) private _params;
    mapping(uint tokenId => address[] users) private _users;
    mapping(uint tokenId => mapping(address user => uint paymentDate))
        private _payments;

    constructor() ERC721("AI App", "AIA") {}

    function create(string memory tokenURI) public {
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function setTokenURI(uint tokenId, string memory tokenURI) public {
        require(_ownerOf(tokenId) == msg.sender, "Not owner");
        _setTokenURI(tokenId, tokenURI);
    }

    function setParams(uint tokenId, uint cost, address token) public {
        require(_ownerOf(tokenId) == msg.sender, "Not owner");
        _params[tokenId] = Params(cost, token, 0, 0, block.timestamp);
    }

    function unlock(uint tokenId) public {
        // Check that the caller is not a user
        require(!_isUser(tokenId, msg.sender), "Already unlocked");
        // Check allowance
        require(
            IERC20(_params[tokenId].token).allowance(
                msg.sender,
                address(this)
            ) >= _params[tokenId].cost,
            "Allowance is not sufficient"
        );
        // Transfer tokens from caller to contract
        require(
            IERC20(_params[tokenId].token).transferFrom(
                msg.sender,
                address(this),
                _params[tokenId].cost
            ),
            "Failed to transfer"
        );
        // Update params
        _params[tokenId].balance += _params[tokenId].cost;
        _params[tokenId].revenue += _params[tokenId].cost;
        // Update users
        _users[tokenId].push(msg.sender);
        // Update paymets
        _payments[tokenId][msg.sender] = block.timestamp;
    }

    function getNextTokenId() public view returns (uint nextTokenId) {
        return _nextTokenId;
    }

    function getParams(
        uint tokenId
    ) public view returns (Params memory params) {
        return _params[tokenId];
    }

    function getUsers(
        uint tokenId
    ) public view returns (address[] memory users) {
        return _users[tokenId];
    }

    function getPaymentDate(
        uint tokenId,
        address user
    ) public view returns (uint paymentDate) {
        return _payments[tokenId][user];
    }

    function isUser(uint tokenId, address user) public view returns (bool) {
        return _isUser(tokenId, user);
    }

    function withdraw(uint tokenId, address destination) public {
        // Check owner and balance
        require(_ownerOf(tokenId) == msg.sender, "Not owner");
        require(_params[tokenId].balance > 0, "Balance is zero");
        // Send tokens
        IERC20(_params[tokenId].token).transfer(
            destination,
            _params[tokenId].balance
        );
        // Update params
        _params[tokenId].balance = 0;
    }

    function _isUser(uint tokenId, address user) internal view returns (bool) {
        for (uint256 i = 0; i < _users[tokenId].length; i++) {
            if (_users[tokenId][i] == user) {
                return true;
            }
        }
        return false;
    }
}
