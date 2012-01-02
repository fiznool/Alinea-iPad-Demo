(function( $, undefined ) {
	
	var EURO_SYMBOL = "&#8364";
	var BIG_CAT		= "_big.jpg"; 	//used to display 
	var SMALL_CAT 	= "_small.jpg";
	
	var allProducts = [];
	
	//Local Storage data keys
	var CATEGORIES_KEY 	= "Categories";
	var PRODUCTS_KEY	= "Products";
	var CUR_PRO_KEY		= "Current_Product";
	var CUR_CAT_KEY		= "Current_Category";
	
	var IMG_PREFIX		= "img/product/full/";
	var IMG_CAT_PREFIX	= "img/category/";
	
	
	$(document).ready(function() {
		
		// First store the prods and cats in localStorage
		$.storeCategories();
		$.storeProducts();
		
		$.populateHomepage();
		
		// Products list
		$('#list').hide();
		$.populateProductsList();
		// Show List on Keyboard change
		var delay = 50;
		$('.ui-listview-filter :input').live('keydown', function(){
			setTimeout('$.showProductsList()', delay);
		});
				
		// Product Info page
		$("#productInfoPage").live("pagebeforeshow",function(event, ui){
			var upc = localStorage.getItem(CUR_PRO_KEY);
			console.log("The product upc on pagebeforeshow is "+upc);
			var item = JSON.parse(localStorage.getItem(upc));
			$.fillProductInfo(item);
		});
		
		$('#productInfoPage').live("pageshow",function(){
			$('#productInfoPage a.footer-find-btn').addClass("ui-btn-active ui-state-persist");
		});
		
		// Product Search and subcats
		//Pull the categories from the datastore
		var cats = [];
		var catObjects = [];
		cats = JSON.parse(localStorage.getItem(CATEGORIES_KEY));
		for (var i = 0;  i < cats.length; i++){
			//console.log("Category "+i+" "+cats[i]);
			catObjects.push(JSON.parse(localStorage.getItem(cats[i])));
		}
		$.createCategoryList(catObjects);
		
		//Pull all products
		var productIds 	= JSON.parse(localStorage.getItem(PRODUCTS_KEY));
		allProducts = [];
		for (var i = 0; i < productIds.length; i++){
			var object = JSON.parse(localStorage.getItem(productIds[i]));
			//console.log(object.name);
			allProducts.push(object);
		}
		
		$('#subCategoriesPage').live("pagebeforeshow",function(event, ui){
			var lastCat = localStorage.getItem(CUR_CAT_KEY);
			if (lastCat === "all"){
				$('#categoryName').html("CatŽgorie / tous les");
				$.createProductsList($('#subCategoryContent'), allProducts);
			} else {
				//create products in only this category 
				//using the category we iterate through the list
				var category = JSON.parse(localStorage.getItem(lastCat));
				$('#categoryName').html("CatŽgorie / "+category.name);
				
				var productIds 	= category.products;
				var products = [];
				for (var i = 0; i < productIds.length; i++){
					products.push(JSON.parse(localStorage.getItem(productIds[i])));
				}
				//$.createProductsList($('#subCategoryContent'), products);
				$.createProductsList($('#product-list'), products);
				//add a category image
				//var header = $("#image-header").clone();
				//header.attr("id",lastCat);
				//$('#product-list').prepend(header);
				//$('#subCategoryContent').remove(".cat-image");
				//$('#subCategoryContent').prepend(header);
				$("#image-header img").attr("src",IMG_CAT_PREFIX+category.imgSrc+BIG_CAT);
			}
			$("#product-list").listview("refresh");
		});
		
		//When a category list element is clicked.
		$('.cat-item').live("vclick",function(event, ui){
			//store the category in local storage
			localStorage.setItem(CUR_CAT_KEY,$(this).data("category"));
			console.log("Clicked on a sub category with id :"+$(this).data("category"));	
			$.mobile.changePage("#subCategoriesPage");
		});
		
		//Clicked on an item
		$('.sub-cat-item').live("vclick", function(event, ui){
			localStorage.setItem(CUR_PRO_KEY,$(this).data("product"));
			console.log("Clicked on an item with upc "+$(this).data("product"));
			$.mobile.changePage("#productInfoPage");
		});
		
		//When the search button is clicked
		$('#search-btn').live("vclick",function(event, ui){
			//set a placeholder here
			$('#categoryName').html("Search all items");
			localStorage.setItem(CUR_CAT_KEY,"all");
			console.log("Clicked on the search button");
		});
		
	});
		
	/* Creates a product object */
	$.createProduct = function (weburl, upc, cat, brand, name, subt,
			desc1, price, saleprice, imgSrc, desc2, pkg, dims, pictos) {
		this.weburl = weburl;	// required, URL of product on alinea.fr website
		this.upc = upc;			// required, 'Référence produit' on website
		this.cat = cat;			// required, Category number (see products.txt for cat numbers)
		this.brand = brand; 	// required, Uppercase heading text on website
		this.name = name;		// required, Lowercase heading text on website, beneath brand
		this.subt = subt;		// required, (Subtitle) Bold text under product name on website
		this.desc1 = desc1;		// required, Text under subtitle on website
		this.price = price; 	// required, in format 90,00
		this.saleprice = saleprice; 	// optional, if product is on sale enter price in here
		this.imgSrc = imgSrc;	// optional, in format ref.jpg (e.g. 21449864.jpg. Need to d/l image from website and put in folder /img/products/full
		this.desc2 = desc2;		// optional, 'Description du produit' on website
		this.pkg = pkg;			// optional, 'Conditionnement' on website
		this.dims = dims;		// optional, 'Dimensions' on website
		this.pictos = pictos;	// optional, array of images in section 'En savoir +' on website. Array contains xx.png where xx is number, check website image source for number
		
		return this;
	};
	
	/* Stores JSON from a JSON txt file into local storage */
	function storeData(url, key) {
		// Only write if there isn't anything there already
		var alreadyDone = localStorage.getItem(key);
		if (!alreadyDone) {
			console.log("No "+key+" in localStorage, now fetching");
			$.ajax({
				url: url,
				dataType: 'json',
				async: false,		// So we wait for the save to occur
				success: function(items) {
					
					var ids = [ ];
					
					// Put each category into local storage
					$.each(items, function(key, val){
						// Store the item in local storage
						localStorage.setItem(key, JSON.stringify(val));
						ids.push(key);
					});
					
					// Write the list of categories under "categories"
					localStorage.setItem(key, JSON.stringify(ids));
					
				}
			});
		}
		
		
	}

	/* Stores JSON Categories file into local storage */
	$.storeCategories = function () {
		storeData("/data/alineaCats-utf-8.json", "Categories");
	}

	/* Stores JSON Products file into local storage */
	$.storeProducts = function() {
		storeData("/data/alineaData-utf-8.json", "Products");
	}
	
	/* Generates the cats UI list */
	$.createCategoryList = function (cats){
		//creat the categories ul
		//var catList = $('#catList').clone();
		//catList.attr("id","liveCatList");
		//$('#content').append(catList);
		//add li for each category
		for (var i = 0; i < cats.length; i++){
			var id			= cats[i].id;
			var item 		= $('#catListItem').clone();	//clone template
			item.attr("id",id);								//change id from template id
			$('#catList').append(item);					//add item to list
			$("#"+id+" a img").attr("src",IMG_CAT_PREFIX+cats[i].imgSrc+SMALL_CAT);
			if (cats[i].imgSrc == null || cats[i].imgSrc == undefined || cats[i].imgSrc == ""){
				$("#"+id+" a img").remove();
			}
			$("#"+id+" a span").html(cats[i].name);
			$("#"+id+" a").attr("href","#");//?cat="+cats[i].cat);	//add link
			$("#"+id).data("category",cats[i].id);
		}
	};

	/* Generates the products UI list */
	$.createProductsList = function (anchorElement, products){
		console.log("We are in the create products list");
		var proList 	= anchorElement;
		var parentId 	= anchorElement.attr("id");					
		proList.empty();						//empty any previous contents
		//create the li
		//console.log(products, "Product list");
		if (products == null || products == undefined){
			console.log("The product list is empty or null");
		} else {
			for (var i = 0; i < products.length; i++){
				var product = products[i];
				if (product == null || products == undefined){
					console.log("The product is null");
				} else {
					var id 		= product.upc;
					var item	= $('#subCatListItem').clone();			//clone template
					item.attr("id",id);									//change id from template
					proList.append(item);								//add item to list
					$("#"+id+" a img").attr("src",IMG_PREFIX+product.imgSrc);	//add image
					if (product.imgSrc == null || product.imgSrc == undefined || product.imgSrc == ""){
						$("#"+id+" a img").remove();
					}
					$("#"+id+" a span.itemName").html(product.name);			//add label
					$("#"+id+" a span.itemPrice").html(product.price+" "+EURO_SYMBOL);
					//data field to hold the upc
					if (product.saleprice == null || product.saleprice == undefined || product.saleprice.trim() == ""){
						//do nothing
					} else {
						$("#"+id+" a span.salePrice").html(product.saleprice+" "+EURO_SYMBOL);
						$("#"+id+" a span.itemPrice").css("text-decoration","line-through");
						//console.log("The sale price is "+product.saleprice);
					}
					
					$("#"+id).data("product",product.upc);
					$("#"+id+" a").attr("href","#"); 
				}//close product null check
			}//close for loop
		}//close product list null check
	};
	
	$.populateHomepage = function() {
		
		var products = [ JSON.parse(localStorage.getItem("21449864")),
		                 JSON.parse(localStorage.getItem("21218248")),
		                 JSON.parse(localStorage.getItem("21452802"))];
		
		var i = 0;
		
		$('div.product-container').each(function(){
			//set the data product upc
			//var productNo = pullRandomProducts(sale);
			
			var product = products[i];
			$(this).data("product",product.upc);
			//populate the product-container with product details
			//console.log($(this).find("div h4 span.price"),"info children of the div");
			//console.log("The sale price is ["+product.saleprice+"]");
			$(this).find("h1.name").html(product.name);
			$(this).find("h2.brand").html(product.brand);
			$(this).find("h4 span.price").html(product.price+" "+EURO_SYMBOL);
			$(this).find("h4 span.saleprice").html(product.saleprice+" "+EURO_SYMBOL);
			
			$(this).find("img.main-img").attr("src",IMG_PREFIX+product.imgSrc);	
			
			i++;

		});
		
		$('div.product-container').live("vclick",function(e){
			//e.preventDefault();
			
			var productUpc = $(this).data("product");
			localStorage.setItem(CUR_PRO_KEY,productUpc);
			console.log("We have clicked on a home product ",productUpc);
			$.mobile.changePage("#productInfoPage");
		});	
			
		function pullRandomProducts(saleProducts){
			if (saleProducts == null){
				console.log("The sale products are null");
			} else if (saleProducts.length == 0){
				console.log("The sale products array is 0");
			} else {
				var productNo = Math.floor(Math.random()*saleProducts.length);
				return productNo;
			}
			return 0;
			//console.log("Random number:"+productNo);
		};
		
		/* Adds only sale products to an array */
		function getSaleProducts(){
			var productIds 	= JSON.parse(localStorage.getItem(PRODUCTS_KEY));
			var saleProducts = [];
			if (productIds == null){
				console.log("We don't have any product ids");
			} else {
				for (var i = 0; i < productIds.length; i++){
					var object = JSON.parse(localStorage.getItem(productIds[i]));
					//console.log(object.saleprice);
					if (object.saleprice != null && object.saleprice != undefined && object.saleprice != ""  ){
						//console.log("We have a sale product "+object.name);
						saleProducts.push(object);
					}
				}
			}
			return saleProducts;
		};
		
		//Reload the swiffy animation on pageshow
		$("#main").live("pagebeforeshow",function(){
			//console.log("On page before show for main");
			$('#swiffy').attr("src","img/home/swiffy-output.htm");
		});
	};
	
	$.fillProductInfo = function(product) {
		// Product Image
		if (product.imgSrc) {
			$('#productImage').html("<img src=\"/img/product/full/"+product.imgSrc+"\" />");
		} else {
			$('#productImage').html("<div id=\"noProductImage\">Image non disponible</div>");	
		}
		
		// Brand / Name
		$('#productSummary').html("");
		$('#productSummary').append("<h1>"+product.brand+"</h1>");
		$('#productSummary').append("<h2>"+product.name+"</h2>");
		$('#productSummary').append("<p>"+product.desc1+"</p>");
		
		// Price
		$('#priceTag').html("");
		$('#priceTag').append("<span id=\"price\">"+product.price+"</span>");
		$('#priceTag').append("<span id=\"currency\">&euro;</span>");	
		
		if (product.saleprice === "" || product.saleprice === null || product.saleprice === undefined){
			//we don't have a sale item.
			$('#salePriceTag').hide();
			$("#priceTag").css("text-decoration","");
			//$('#salePriceTag').empty();
		} else {
			//Sale Price
			$('#salePriceTag').empty();
			$('#salePriceTag').append("<span id=\"salePrice\">"+product.saleprice+"</span>");
			$('#salePriceTag').append("<span id=\"salecurrency\">&euro;</span>");
			$('#salePriceTag').show();
					
			$("#priceTag").css("text-decoration","line-through");
		}
		
		// Product Details
		// Left column
		$('#productDetailsLeftColumn').empty();
		$('#productDetailsLeftColumn').append("<h1>Description du produit</h1>");
		if (product.desc2) $('#productDetailsLeftColumn').append("<p>"+product.desc2+"</p>");
		if (product.colour) $('#productDetailsLeftColumn').append("<p>"+product.colour+"</p>");
		
		// Right column
		$('#productDetailsRightColumn').empty();
		$('#productDetailsRightColumn').append("<h1>R&#233;f&#233;rence produit</h1>");
		$('#productDetailsRightColumn').append("<p>"+product.upc+"</p>");
		
		if (product.pkg) {
			$('#productDetailsRightColumn').append("<h1>Conditionment</h1>");
			$('#productDetailsRightColumn').append("<p>"+product.pkg+"</p>");
		}
		if (product.dims) {
			$('#productDetailsRightColumn').append("<h1>Dimensions</h1>");
			$('#productDetailsRightColumn').append("<p>"+product.dims+"</p>");
		}
		if (product.pictos && product.pictos.length > 0) {
			// product.pictos is an array
			$('#productDetailsRightColumn').append("<h1>En savoir +</h1>");
			var len=product.pictos.length;
			for ( var i=0; i<len; i++ ){
				$('#productDetailsRightColumn').append("<p><img src=\"/img/product/picto/"+product.pictos[i]+"\"  class=\"picto\"/></p>");
			}
		}
		
	};
	
	$.populateProductsList = function() {
		var listMarkup = [];
		var products = JSON.parse(localStorage.getItem("Products"));
		
		console.log("Products from localStorage: ", products);
		
		var allProduct = [];
		for (var i = 0; i < products.length; i++){
			var id = products[i];	
			var prod = JSON.parse(localStorage.getItem(id))
			allProduct.push(prod);
			
			/*
			var listItemMarkup = '<li><a class="productLink" href="#productPage" id="' + id + '">' + 
			'<img src="' + prod.imgSrc + '" />' +
			'<h3 class="name">' + prod.name + '</h3>' +
			'<p class="department ui-li-aside">' + ' Department</p>' +
			'<p class="description">' + prod.desc1 + '</p></a></li>'
			
			listMarkup.push(listItemMarkup);*/
		
		}
		$.createProductsList($("#list"),allProduct);
	};
	
	$.showProductsList = function() {
		if($('.ui-listview-filter :input').val() == ""){
			$('#list').hide();
		}
		else{
			$('#list').show();
		}
	};
	
	/*
	 * Prints off the field and functions for a an object
	 */
	$.print = function(obj, message){
		if (!message){
			message = obj;
		}
		if (obj == null || obj == undefined){
			console.log(message+" is undefined");
		} else {
			var details = "Contents of object : "+message+"\n";
			for (var key in obj){
				var fieldContents = obj[key];
				if (fieldontents == "function"){
					fieldContents = "(function)";
				}
				details += (key+":"+obj[key]+"\n");	
			}
			console.log(details);
		}
	};
	
	/*
	 * Prints off the field and functions for a an object
	 */
	$.printAlert = function(obj, message){
		if (!message){
			message = obj;
		}
		if (obj == null || obj == undefined){
			console.log(message+" is undefined");
		} else {
			var details = "Contents of object : "+message+"\n";
			for (var key in obj){
				var fieldContents = obj[key];
				if (fieldContents == "function"){
					fieldContents = "(function)";
				}
				details += (key+":"+obj[key]+"\n");	
			}
			alert(details);		
		}
	};

})(jQuery);

