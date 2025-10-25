// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SupplyChain
 * @dev Smart contract for tracking supply chain events
 */
contract SupplyChain {
    
    enum Status { Created, InTransit, Delivered, Verified }
    
    struct Event {
        string productId;
        Status status;
        address actor;
        string location;
        string notes;
        uint256 timestamp;
    }
    
    // Mapping from product ID to array of events
    mapping(string => Event[]) public productEvents;
    
    // Mapping to track product ownership
    mapping(string => address) public productOwner;
    
    // Events
    event ProductCreated(
        string indexed productId,
        address indexed creator,
        string location,
        uint256 timestamp
    );
    
    event ProductTransferred(
        string indexed productId,
        address indexed from,
        address indexed to,
        string location,
        uint256 timestamp
    );
    
    event ProductStatusUpdated(
        string indexed productId,
        Status status,
        address indexed updatedBy,
        string location,
        uint256 timestamp
    );
    
    event ProductVerified(
        string indexed productId,
        address indexed verifiedBy,
        uint256 timestamp
    );
    
    /**
     * @dev Create a new product in the supply chain
     */
    function createProduct(
        string memory _productId,
        string memory _location,
        string memory _notes
    ) public {
        require(productOwner[_productId] == address(0), "Product already exists");
        
        productOwner[_productId] = msg.sender;
        
        Event memory newEvent = Event({
            productId: _productId,
            status: Status.Created,
            actor: msg.sender,
            location: _location,
            notes: _notes,
            timestamp: block.timestamp
        });
        
        productEvents[_productId].push(newEvent);
        
        emit ProductCreated(_productId, msg.sender, _location, block.timestamp);
    }
    
    /**
     * @dev Transfer product to another address
     */
    function transferProduct(
        string memory _productId,
        address _to,
        string memory _location,
        string memory _notes
    ) public {
        require(productOwner[_productId] == msg.sender, "Not the owner");
        require(_to != address(0), "Invalid recipient");
        
        address from = productOwner[_productId];
        productOwner[_productId] = _to;
        
        Event memory newEvent = Event({
            productId: _productId,
            status: Status.InTransit,
            actor: msg.sender,
            location: _location,
            notes: _notes,
            timestamp: block.timestamp
        });
        
        productEvents[_productId].push(newEvent);
        
        emit ProductTransferred(_productId, from, _to, _location, block.timestamp);
    }
    
    /**
     * @dev Update product status
     */
    function updateStatus(
        string memory _productId,
        Status _status,
        string memory _location,
        string memory _notes
    ) public {
        require(productOwner[_productId] != address(0), "Product does not exist");
        
        Event memory newEvent = Event({
            productId: _productId,
            status: _status,
            actor: msg.sender,
            location: _location,
            notes: _notes,
            timestamp: block.timestamp
        });
        
        productEvents[_productId].push(newEvent);
        
        emit ProductStatusUpdated(_productId, _status, msg.sender, _location, block.timestamp);
    }
    
    /**
     * @dev Verify product authenticity
     */
    function verifyProduct(string memory _productId) public {
        require(productOwner[_productId] != address(0), "Product does not exist");
        
        emit ProductVerified(_productId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get product history
     */
    function getProductHistory(string memory _productId) 
        public 
        view 
        returns (Event[] memory) 
    {
        return productEvents[_productId];
    }
    
    /**
     * @dev Get product owner
     */
    function getProductOwner(string memory _productId) 
        public 
        view 
        returns (address) 
    {
        return productOwner[_productId];
    }
    
    /**
     * @dev Get latest event for a product
     */
    function getLatestEvent(string memory _productId) 
        public 
        view 
        returns (
            Status status,
            address actor,
            string memory location,
            string memory notes,
            uint256 timestamp
        ) 
    {
        require(productEvents[_productId].length > 0, "No events found");
        
        Event memory latestEvent = productEvents[_productId][productEvents[_productId].length - 1];
        
        return (
            latestEvent.status,
            latestEvent.actor,
            latestEvent.location,
            latestEvent.notes,
            latestEvent.timestamp
        );
    }
}
