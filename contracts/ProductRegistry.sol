// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ProductRegistry
 * @dev Smart contract for registering and tracking products on blockchain
 */
contract ProductRegistry {
    
    struct Product {
        string productId;
        string name;
        string origin;
        string category;
        uint256 timestamp;
        address registeredBy;
        bool exists;
    }
    
    // Mapping from product ID to Product
    mapping(string => Product) public products;
    
    // Array to keep track of all product IDs
    string[] public productIds;
    
    // Events
    event ProductRegistered(
        string indexed productId,
        string name,
        string origin,
        string category,
        address indexed registeredBy,
        uint256 timestamp
    );
    
    event ProductUpdated(
        string indexed productId,
        address indexed updatedBy,
        uint256 timestamp
    );
    
    /**
     * @dev Register a new product
     */
    function registerProduct(
        string memory _productId,
        string memory _name,
        string memory _origin,
        string memory _category
    ) public returns (bool) {
        require(!products[_productId].exists, "Product already registered");
        
        Product memory newProduct = Product({
            productId: _productId,
            name: _name,
            origin: _origin,
            category: _category,
            timestamp: block.timestamp,
            registeredBy: msg.sender,
            exists: true
        });
        
        products[_productId] = newProduct;
        productIds.push(_productId);
        
        emit ProductRegistered(
            _productId,
            _name,
            _origin,
            _category,
            msg.sender,
            block.timestamp
        );
        
        return true;
    }
    
    /**
     * @dev Get product details
     */
    function getProduct(string memory _productId) 
        public 
        view 
        returns (
            string memory productId,
            string memory name,
            string memory origin,
            string memory category,
            uint256 timestamp,
            address registeredBy
        ) 
    {
        require(products[_productId].exists, "Product not found");
        
        Product memory product = products[_productId];
        return (
            product.productId,
            product.name,
            product.origin,
            product.category,
            product.timestamp,
            product.registeredBy
        );
    }
    
    /**
     * @dev Check if product exists
     */
    function productExists(string memory _productId) public view returns (bool) {
        return products[_productId].exists;
    }
    
    /**
     * @dev Get total number of registered products
     */
    function getTotalProducts() public view returns (uint256) {
        return productIds.length;
    }
}
