App = {
  web3Provider: null,
  contracts: {},
  account: '',
  productCount: 0,
  products: [],
  loading: true,



  init: async function() {
    // Load products
    $.getJSON('../products.json', function(data) {
      var productsRow = $('#productsRow');
      var productTemplate = $('#productTemplate');

      // var etherPrice = web3.fromWei(price, 'Ether');

      for (i = 0; i < data.length; i ++) {
        
        productTemplate.find('.panel-title').text(data[i].name);
        productTemplate.find('img').attr('src', data[i].picture);
        productTemplate.find('.product-type').text(data[i].type);
        productTemplate.find('.product-price').text(web3.fromWei(data[i].price, 'Ether') + ' Ether');
        productTemplate.find('.product-origin').text(data[i].origin);
        productTemplate.find('.btn-buy').attr('data-id', data[i].id);

        productsRow.append(productTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Purchase.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var PurchaseArtifact = data;
      App.contracts.Purchase = TruffleContract(PurchaseArtifact);

      // Set the provider for our contract
      App.contracts.Purchase.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted products
      return App.markPurchased();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.buy);
  },

  markPurchased: function(buyers, account) {
    var purchaseInstance;

    App.contracts.Purchase.deployed().then(function(instance) {
      purchaseInstance = instance;

     return purchaseInstance.getBuyers().call();
    }).then(function(buyers) {
      for (i = 0; i < buyers.length; i++) {
        if (buyers[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-product').eq(i).find('button').text('Out of Stock').attr('disabled', true);
          // $('.panel-product').eq(i).find('product-owner').text('hey');
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  buy: function(event) {
    event.preventDefault();

    var productId = parseInt($(event.target).data('id'));
    var price = parseInt($(event.target).data('price'));

    var purchaseInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Purchase.deployed().then(function(instance) {
        purchaseInstance = instance;
        return purchaseInstance.buy(productId, {from: account});
      }).then(function(result) {
        return App.markPurchased();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },


  };




$(function() {
  $(window).load(function() {
    App.init();
  });
});


   
