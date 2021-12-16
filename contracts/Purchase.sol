pragma solidity ^0.5.0;

contract Purchase{
	address [16] public buyers;
	uint public productCount =0;
	string public name;
	

	struct Product {
		uint productId;
		string name;
		uint price;
		address payable owner;
		bool purchased;

	}
	mapping(uint => Product) public products;
	

	event SellProduct(
        uint indexed productId,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        uint productId,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );
    constructor() public {
    	name = "The Flower Shoppe!";
    }
 

	function productToSell(string memory _name, uint _price) public {
        //make sure parameters are correct
        //require valid name
        require(bytes(_name).length > 0);
        //require valid price
        require(_price > 0);
         //increment product count
        productCount ++;
        //create product
        products[productCount]= Product(productCount, _name, _price, msg.sender, false);
        //trigger event
        emit SellProduct(productCount, _name, _price, msg.sender, false);
        
  }

	function buy(uint productId) public payable returns(uint){
	// fetch the product
		Product memory product= products[productId];
		//fetch the owner
		address payable seller = product.owner;
		//make sure id is valid
		require(product.productId > 0 && product.productId <= productCount);
		//make sure there is enough funds
		require(product.price <= msg.value);
		//make sure the product hasnt been purchased yet
		require(!product.purchased);
		//the buyer cant be the seller
		require(seller != msg.sender);
		//purchase it,transfer ownership
		product.owner = msg.sender;
		buyers[productId]= product.owner;
		//product is purchased
		product.purchased = true;
		//update product
		products[productId]= product;
		
		//pay the owner
		address(seller).transfer(msg.value);
		//trigger event
		emit ProductPurchased(productCount, product.name, product.price, msg.sender, true);
		return productId;
	}

	function getPurchaser(uint productId) public view returns (address) {
		return products[productId].owner;
	}
	function getBuyers() public view returns (address[16] memory) {
  		return buyers;
	}
	function getAvailableProducts() public view returns (uint[] memory){
    	uint numberAvailProducts = 0;
    	for(uint i=1; i <= productCount; i++){
    		if(!products[i].purchased)	{
    			numberAvailProducts++;
    		}
    	}
    	uint[] memory productsStillForSale = new uint[](numberAvailProducts);
    	for(uint i=1; i <= productCount; i++){
    		uint count =0;
    		if(!products[i].purchased)	{
    			productsStillForSale[count] = products[i].productId;
    			count ++;
    		}
    	}
    	return (productsStillForSale);
    }
}