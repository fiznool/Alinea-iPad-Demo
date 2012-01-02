/*
 * Simple file used to override the default jQuery Mobile options
 * Must be after jQuery js file but before the jQuery Mobile js file
 * as it uses the 'mobileinit' event.
 *
 */
(function($, undefined) {
	
	// Binds event handler to when jqMobile finishes initiating
	$(document).bind('mobileinit',function(){
		// Override default jqMobile options
		$.mobile.page.prototype.options.addBackBtn = true;
		$.mobile.defaultTransition = 'none';	// Disable transitions
		$.mobile.page.prototype.options.backBtnText = "Retour"
		$.mobile.loadingMessage = "chargement";
		$.mobile.loadingMessage = "Erreur de chargement";
	});
	
})(jQuery);

