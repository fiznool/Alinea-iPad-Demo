(function( $, undefined ) {
	
  var EURO_SYMBOL = "&#8364;";
  var BIG_CAT     = "_big.jpg"; 	//used to display 
  var SMALL_CAT   = "_small.jpg";

  var allProducts = [];

  //Local Storage data keys
  var CATEGORIES_KEY = "Categories";
  var PRODUCTS_KEY   = "Products";
  var CUR_PRO_KEY    = "Current_Product";
  var CUR_CAT_KEY    = "Current_Category";

  var IMG_PREFIX     = "img/product/full/";
  var IMG_CAT_PREFIX = "img/category/";


  /* Stores JSON from a JSON txt file into local storage */
  var storeData = function(url, key) {
    // Only write if there isn't anything there already
    if (!localStorage.getItem(key)) {
      console.log("No "+key+" in localStorage, now fetching");

      $.ajax({
        url: url,
        dataType: 'json',
        async: false,		// So we wait for the save to occur
        success: function(items) {
          
          var ids = [ ];
          
          // Put each item into local storage
          $.each(items, function(key, val){
            localStorage.setItem(key, JSON.stringify(val));
            ids.push(key);
          });
        
          // Store all of the item keys in a master entry
          localStorage.setItem(key, JSON.stringify(ids));
        }
      });

    }
  };

  var getAll = function(key) {
    var data = JSON.parse(localStorage.getItem(key));
    
    console.log(key + " from localStorage: ", data);
    
    var all = [];
    for (var i = 0; i < data.length; i++){
      var id = data[i];	
      var val = JSON.parse(localStorage.getItem(id))
      all.push(val);
    }

    return all;
  };

  
  // Grab the product data and put it in local storage
  storeData("/data/alineaCats-utf-8.json", CATEGORIES_KEY);
  storeData("/data/alineaData-utf-8.json", PRODUCTS_KEY);

  $(document).ready(function() {
   
    
    // Prepare Home Page

    //Reload the swiffy animation when the home page is shown
    $("#main").live("pagebeforeshow",function() {
      $('#swiffy').attr("src","img/home/swiffy-output.htm");
    });

    // Fill in 3 special offer products on home page
    var specialOfferSrc = $("#special-offers-tmpl").html();
    var specialOfferTmpl = Handlebars.compile(specialOfferSrc);
    var specialOfferEl = $("#home-products");

    var populateSpecialOffer = function(upc, seq) {
      var product = JSON.parse(localStorage.getItem(upc));
      product.seq = seq;
      specialOfferEl.append(specialOfferTmpl(product));
    };

    populateSpecialOffer("21449864", "a");
    populateSpecialOffer("21218248", "b");
    populateSpecialOffer("21452802", "c");
    
    $("div.product-container").live("vclick", function() {
      localStorage.setItem(CUR_PRO_KEY, $(this).data("product"));
      $.mobile.changePage("#productInfoPage");
    });
   
    // Product Categories
    var categoryListSrc = $("#category-list-tmpl").html();
    var categoryListTmpl = Handlebars.compile(categoryListSrc);

    var catEl = $("#category-list");
    var categories = getAll(CATEGORIES_KEY);

    for (var i = 0, len = categories.length; i < len; i++) {
      var item = categoryListTmpl(categories[i]);
      catEl.append(item);
    }
   
    // When a category list element is clicked.
    $('.cat-item').live("vclick",function(event, ui){
      //store the category in local storage
      localStorage.setItem(CUR_CAT_KEY,$(this).data("category"));
      $.mobile.changePage("#productListPage");
    });
    
    // Products List
    var productListSrc = $("#product-list-tmpl").html();
    var productListTmpl = Handlebars.compile(productListSrc);

    // Before the product list is shown, get the current category and display
    $('#productListPage').live("pagebeforeshow",function(event, ui){
      // Find only the products in this category, and show
      var lastCat = localStorage.getItem(CUR_CAT_KEY);
      var category = JSON.parse(localStorage.getItem(lastCat));
      
      var productIds = category.products;
      var el = $('#product-list');

      el.empty();

      for (var i = 0, len = productIds.length; i < len; i++){
        var product = JSON.parse(localStorage.getItem(productIds[i]));
        product.priceclass = product.saleprice ? "onsale" : "regularprice";
        var item = productListTmpl(product);
        el.append(item);
      }
      
      $("#image-header img").attr("src",IMG_CAT_PREFIX+category.imgSrc+BIG_CAT);
      $("#product-list").listview("refresh");

    });
    
    //Clicked on an item
    $('.sub-cat-item').live("vclick", function(event, ui){
      localStorage.setItem(CUR_PRO_KEY,$(this).data("product"));
      $.mobile.changePage("#productInfoPage");
    });
   
    // Product Info page
    var productInfoSrc = $("#product-info-tmpl").html();
    var productInfoTmpl = Handlebars.compile(productInfoSrc);
    var productInfoEl = $("#productInfoView");

    $("#productInfoPage").live("pagebeforeshow",function(event, ui){
      var upc = localStorage.getItem(CUR_PRO_KEY);
      var item = JSON.parse(localStorage.getItem(upc));
      item.priceclass = item.saleprice ? "onsale" : "regularprice"; 
      productInfoEl.html(productInfoTmpl(item));
    });
    
    // Call for Help dialog
    $("#connectConfirmBtn").live("vclick", function() {
      $("#connectStep1").hide();
      $("#connectStep2").show();
    });

    $("#connectPage").live("pagehide", function() {
      $("#connectStep1").show();
      $("#connectStep2").hide();
    });

  });

})(jQuery);
