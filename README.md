# AngularJS Localization with jQuery Selectors #


jQuery Selector Localization Module with JSON format for AngularJS.
<br><br>

 ____________
**ANGULARJS CONFIG**<br><br>

> **INITIALIZE MODULE:**<br><br>
> Syntax:
> `localize.initialize(settings)`<br>
> Example
> `localize.initialize({ optimizePrefix: true, preRenderAgent: "PhantomJS"});`<br>
> Description: Initialize the localization module on run. Optional settings:<br>
> Set `optimizePrefix` to true for any language with unknown suffix as default language.<br>
> Set `preRenderAgent` as the useragent string for search engine prerendering browser.<br> 
<br>
> **ADD NEW LANGUAGE:**<br><br>
> Syntax:
> `localizeProvider.addLanguage(language-key)`<br>
> Example
> `localizeProvider.addLanguage("en");`<br>
> Description: Allocates a language in the catalog. Use the language key for any URL assignments.<br>
> Note that the key will be used for href lang attributes and as navigator comparison value. For search<br> engine friendly localization use the Web API [spa-template](https://github.com/bajak/spa-template "spa-template") as reference. 

<br>
> **DEFAULT LANGUAGE:**<br><br>
> Syntax:
> `localizeProvider.setDefaultLanguage("language-key")`<br>
> Example
> `localizeProvider.setDefaultLanguage("en");"`<br>
> Description: Sets the default localization for `x-default` and any unregistered langauge.

<br>
> **ROOT LANGUAGE FILE:**<br><br>
> Syntax:
> `localizeProvider.addDefaultUrl("language-key", "URL")`<br>
> Example
> `localizeProvider.addDefaultUrl("en", "./Content/Text/index-en-EN.json");`<br>
> Description: Loads language files that not related to any route.

<br>
> **ADD LANGUAGE FUNCTION:**<br><br>
> Syntax:
> `localizeProvider.addDefaultUrl("language-key", "URL")`<br>
> Example
> `addCondition(en, function() { console.log("language is english"); });`<br>
> Description: Executes a function by matching the language key.

<br>
> **EXAMPLE CONFIG**


    app.run(["localize", function(localize) {
		//initialize module on run
		localize.initialize({ optimizePrefix: true, preRenderAgent: "PhantomJS"});
    }]);

	app.config(["localizeProvider", function (localizeProvider) {
		//add languages to catalog
        localizeProvider.addLanguage("en");
        localizeProvider.addLanguage("en-US");
		localizeProvider.addLanguage("de");
		localizeProvider.addLanguage("de-CH");
    
        //set the default langauge
        localizeProvider.setDefaultLanguage("en-EN");
        
        //load root language files
        localizeProvider.addDefaultUrl("en", "./Content/Text/index-en.json");
		localizeProvider.addDefaultUrl("en-US", "./Content/Text/index-en-US.json");
        localizeProvider.addDefaultUrl("de", "./Content/Text/index-de.json");
		localizeProvider.addDefaultUrl("de-DE", "./Content/Text/index-de-CH.json");
    }]);
<br>
____________

**LOCALIZATION FORMAT:**<br><br>

>**SET A ELEMENT CONTENT:**<br><br>
> JSON Syntax:
> `{ "selector" : "HTML code" }`<br>
> Example:
> `{ ".panel-heading" : "<p class='panel-title'>Header Text</p" }`<br>
> Description: Use jQuery selectors as key and set the value as content. HTML code is allowed.

<br>
> **SET ATTRIBUTE VALUE:**<br><br>
> JSON Syntax:
> `{ "selector /[attribute/]" : "value" }`<br>
> Example
> `{ "input[text] /[placeholder/]" : "Type here..." }`<br>
> Description: Use jQuery selectors as key and escape brackets with the name of a attribute.<br>
> Set the object value as any attribute value.

<br>
>**SET ROOTSCOPE OBJECT:**<br><br>
> JSON Syntax:
> `{ "$property" : "object" }`<br>
> Example
> `{ "$model.imgSources" : ["./start.png", "./contact.png", "./privacy.png"] }`<br>
> Description: Use the $ sign in addition of the property name as key and set any object as value.<br>
> You can access the property by `$rootScope.model.imgSources` for example.

<br>
> **JSON EXAMPLE:**<br><br>
> ../content/text/index-en-EN.json

	{ "$model.metaTitle" 					: "SPA Meta Title EN (inside $rootScope.model.metaTitle)",
      "$model.metaDescription" 				: "SPA Meta Description EN",
      ".lang-label" 						: "Language: ",
      "#lang-de" 							: "DE",
      "#lang-en" 							: "EN",
      "input[text] /[placeholder/]"			: "This is the placeholder attribute text.",
      ".menu-item > a[href='/Start']" 		: "Start",
      ".menu-item > a[href='/About']" 		: "About" }

> ../content/text/start-en-EN.json

	{ "#start-header" 						: "<h1>Hello World</h1>",
      "#start-text" 						: "<span>Welcome to my website<span>" }

<br>
____________


**ANGULARJS ROUTING**
<br>
<br>
> **ROOT LANGUAGE FILE:**<br><br>
> Syntax:
> `localizeUrl: { "language-key": "URL" }`<br>
> Example
> `localizeUrl: { "en": "./Content/Text/start-en.json" }");`<br>
> Description: Loads language files that are related to a route.

<br>
> **EXAMPLE ROUTING**

    app.config(["$routeProvider", function ($routeProvider) {
        $routeProvider.when("/Start",
            {
                templateUrl: "./Views/start.html",
                controller: "StartCtrl",
                localizeUrl: {
					"en": "./Content/Text/start-en.json",
                    "en-US": "./Content/Text/start-en-US.json",
					"de": "./Content/Text/start-de.json",
                    "de-CH": "./Content/Text/start-de-CH.json"
            }
            }).when("/About",
            {
                templateUrl: "./Views/about.html",
                controller: "AboutCtrl",
                localizeUrl: {
					"en": "./Content/Text/about-en.json",
                    "en-US": "./Content/Text/about-en-US.json",
					"de": "./Content/Text/about-de.json",
                    "de-CH": "./Content/Text/about-de-CH.json"
            }
            }).
            otherwise(
            {
                redirectTo: "/Start"
            });
    }]);
____________


**ANGULARJS FUNCTIONS**
<br>
<br>
> **CHANGE CURRENT LANGUAGE:**<br><br>
> Syntax:
> `localize.changeLanguage("language-key")`<br>
> Example
> `localize.changeLanguage("en")`;`<br>
> Description: Change the current language in runtime without any reload.

<br>
>**GET CURRENT LANGUAGE:**<br><br>
> JSON Syntax:
> `localize.getCurrentLanguage()`<br>
> Description: Get the current language.

<br>
> **EXAMPLE FUNCTIONS**

	<html ng-app="app">
		<body ng-controller="IndexCtrl">
	    	<a id="Header-Lang-en" ng-click="changeLanguage('en')"></a>
	    	<a id="Header-Lang-de" ng-click="changeLanguage('de')"></a>
			<span>The current language is {{ getCurrentLanguage() }}</span>
		</body>
	<html>

	app.controller("IndexCtrl", ["$scope", "localize", function($scope, localize) {
		$scope.changeLanguage  = localize.changeLanguage;
		$scope.getCurrentLanguage  = localize.getCurrentLanguage;
	}
____________
**ADDITIONAL INFORMATIONS**
<br>
<br>

> **FEATURES**<br>
>  - Change language in runtime
>  - jQuery selectors with HTML
>  - Attribute value localization
>  - AngularJS Scope localization
>  - Search engine friendly code


> **REQUIREMENTS:**<br>
> ngRoute, ngCookies, jQuery

<br>
**Hire me as a freelancer**
<br>
`Author: Wojciech Lukasz Bajak`<br>
`Phone: (+049) 40 532 555 00`<br>
`Email: info[at]bajak.net`<br>
`Internet:` http://www.softwarechannel.net<br>
