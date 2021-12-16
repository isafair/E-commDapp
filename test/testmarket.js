//contract
const Purchase = artifacts.require("./Purchase.sol");

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Purchase', ([deployer, seller, buyer, buyer2]) => {
	let marketplace

	before(async () => {
    marketplace = await Purchase.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await marketplace.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await marketplace.name()
      assert.equal(name, 'The Flower Shoppe!')
    })
  })
  describe('products', async () => {
    let result, productCount

    before(async () => {
      result = await marketplace.productToSell('Rose', web3.utils.toWei('1.2', 'Ether'), { from: buyer })
      productCount = await marketplace.productCount()
    })

    it('creates products', async () => {
      // SUCCESS
      assert.equal(productCount, 1)
      const event = result.logs[0].args
      assert.equal(event.productId.toNumber(), productCount.toNumber(), 'id is correct')
      assert.equal(event.name, 'Rose', 'name is correct')
      assert.equal(event.price, '1200000000000000000', 'price is correct')
      assert.equal(event.owner, buyer, 'owner is correct')
      assert.equal(event.purchased, false, 'purchased is correct')
  	})
    it('product has to have a name', async () =>{
    	await await marketplace.productToSell('', web3.utils.toWei('1.2', 'Ether'), { from: buyer }).should.be.rejected;
    })
    it('product has to have a price', async () => {
    	await marketplace.productToSell('Rose', 0, { from: buyer }).should.be.rejected;
    })
    it('get number of availible products', async () => {
    	let productSale 
    	productSale = await marketplace.getAvailableProducts()
    	productSale = productSale.length
    	assert.equal(1, productSale, 'number of products for sale')
    	const event = result.logs[0].args
    	assert.equal(event.name, 'Rose', 'name is correct')
    	assert.equal(event.productId.toNumber(), productCount.toNumber(), 'name is correct')
    	assert.equal(event.price, '1200000000000000000', 'price is correct')
      	assert.equal(event.owner, buyer, 'owner is correct')
     	assert.equal(event.purchased, false, 'purchased is correct')
    })
    
      
  	it('sale transaction is correct', async () => {
	  let oldSellerBalance
	  oldSellerBalance = await web3.eth.getBalance(buyer)
	  oldSellerBalance = new web3.utils.BN(oldSellerBalance)
	  	
	  result = await marketplace.buy(productCount, { from: seller, value: web3.utils.toWei('1.2', 'Ether')})

	  const event = result.logs[0].args
	  assert.equal(event.productId.toNumber(), productCount.toNumber(), 'id is correct')
	  assert.equal(event.name, 'Rose', 'name is correct')
	  assert.equal(event.price, '1200000000000000000', 'price is correct')
	  assert.equal(event.owner, seller, 'owner is correct')
	  assert.equal(event.purchased, true, 'purchased is correct')

	  let newSellerBalance
	  newSellerBalance = await web3.eth.getBalance(buyer)
	  newSellerBalance = new web3.utils.BN(newSellerBalance)

	  let price
	  price = web3.utils.toWei('1.2', 'Ether')
	  price = new web3.utils.BN(price)

	  const exepectedBalance = oldSellerBalance.add(price)

	  assert.equal(newSellerBalance.toString(), exepectedBalance.toString())
     
  	})
	it('you cant buy your own product', async () =>{
		await marketplace.buy(productCount, { from: buyer, value: web3.utils.toWei('1.2', 'Ether') }).should.be.rejected;
	})

	it('product doesnt exist', async () => {
		await marketplace.buy(99, { from: seller, value: web3.utils.toWei('1.2', 'Ether')}).should.be.rejected;  
	}) 

	it('Not enough money for purchase', async () => {
		await marketplace.buy(productCount, { from: seller, value: web3.utils.toWei('1.2', 'Ether')}).should.be.rejected;  
	})

	it('Only one buyer', async () => {
		await marketplace.buy(productCount, { from: deployer, value: web3.utils.toWei('1.2', 'Ether')}).should.be.rejected;  
	})
	it('successfully get buyer of a product', async () => {
		let theBuyer 
		theBuyer = await marketplace.getPurchaser(productCount)
		assert.equal(theBuyer, seller, 'expected owner')
	})
	it('successfully get buyer of a product', async () => {
		let theBuyer 
		theBuyer = await marketplace.getBuyers()
		assert.equal(theBuyer[productCount], seller, 'expected owner')
	})
})

})

