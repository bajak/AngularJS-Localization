"use strict";

var app = angular.module("localization", ["ngCookies"]);

app.provider("localize", function() {
    var viewCache = {};
    var languages = {};
    var defaultLang = "en";
    var defaultUrl = {};
    var conditions = [];
    var cLanguage = "";
    var cSettings = {
        optimizePrefix: true,
        preRenderAgent: "PhantomJS"
    };
    this.addLanguage = function(language) {
        languages[language] = true;
    };
    this.setDefaultLanguage = function(language) {
        defaultLang = language;
    };
    this.addDefaultUrl = function(language, url) {
        defaultUrl[language] = url;
    };
    this.addCondition = function(language, func) {
        conditions.push({language: language, func: func});
    };
    this.$get = ["$rootScope", "$cookies", "$location", "$window", "$route", function($rootScope, $cookies, $location, $window, $route) {
        var mapAttrProperties = function(template, propertyKey, propertyValue) {
            var attrRegEx = /\/\[(.+?)\/\]/g;
            var attrKeys = propertyKey.match(attrRegEx);
            var elementKey = propertyKey.replace(attrRegEx, "");
            if (attrKeys != null) {
                for (var i = 0; i < attrKeys.length; i++) {
                    attrKeys[i] = attrKeys[i].replace(new RegExp("/\\[", "g"), "").
                        replace(new RegExp("/\\]", "g"), "");
                    template.find(elementKey).attr(attrKeys[i], propertyValue);
                }
                return true;
            }
            return false;
        };
        var mapDataProperties = function(propertyKey, propertyValue) {
            var index = propertyKey.indexOf("$");
            if (index !== -1) {
                var funcTree = propertyKey.substr(index + 1)
                    .replace(" ", "")
                    .split(".");
                var lastObject = $rootScope;
                for (var i = 0; i < funcTree.length; i++) {
                    if (i == funcTree.length - 1)
                        lastObject[funcTree[i]] = propertyValue;
                    else if (lastObject[funcTree[i]] === undefined)
                        lastObject[funcTree[i]] = {};
                    lastObject = lastObject[funcTree[i]];
                }
                return true;
            }
            return false;
        };
        var isCrawler = function() {
            var userAgent = navigator.userAgent;
            return userAgent.indexOf(cSettings.preRenderAgent) > -1;
        };
        var loadView = function(url, controller, template, cache, isDocument) {
            if (isDocument)
                cache = false;
            if (cache && viewCache[controller] !== undefined)
                return viewCache[controller];
            viewCache[controller] = template;
            var xhr = $.ajax( { url: url, type: "GET", cache: false, async: false });
            if (xhr.status != 200)
                return viewCache[controller];
            var jTemplate;
            if (isDocument) {
                jTemplate = $(viewCache[controller]);
            }
            else
                jTemplate = $("<div></div>").append($(viewCache[controller]));
            var data = xhr.responseJSON;
            for (var propertyKey in data) {
                if (!data.hasOwnProperty(propertyKey))
                    continue;
                var propertyValue = data[propertyKey];
                if (!mapDataProperties(propertyKey, propertyValue)) {
                    if (!mapAttrProperties(jTemplate, propertyKey, propertyValue))
                        jTemplate.find(propertyKey).html(propertyValue);
                }
            }
            if (!isDocument)
                viewCache[controller] = jTemplate.html();
            return viewCache[controller]
        };
        var localizeView = function(url, language, controller, template, cache, isDocument) {
            for (var key in url) {
                if (!url.hasOwnProperty(key))
                    continue;
                if (language.toLowerCase() != key.toLowerCase())
                    continue;
                return loadView(url[key], controller, template, cache, isDocument);
            }
            return template;
        };
        var localizeTemplate = function(template) {
            var url = $(template).attr("localize-url");
            if (url === undefined)
                return template;
            return localizeView(JSON.parse(url), cLanguage, {}, template, false, false);
        };
        var isSupportedLanguage = function(language) {
            var isSupported = false;
            for (var key in languages) {
                if (!languages.hasOwnProperty(key))
                    continue;
                if (key != language.toLowerCase())
                    continue;
                isSupported = true;
                break;
            }
            return isSupported;
        };
        var execConditions = function(language) {
            for (var i = 0; i < conditions.length; i++) {
                if (conditions[i].language.toLowerCase() != language.toLowerCase())
                    continue;
                conditions[i].func();
            }
        };
        var getLanguage = function() {
            var lang = $location.search()["hl"];
            if (lang === undefined)
                lang = $cookies.language;
            if (lang === undefined)
                lang = window.navigator.userLanguage || window.navigator.language;
            return lang;
        };
        var changeLanguage = function(language, init) {
            if (cSettings.optimizePrefix && language.length >= 3)
                var separatorIndex = language.indexOf("-");
                if (separatorIndex > 0)
                    language = language.substring(0, language.indexOf("-"));
            if (!isSupportedLanguage(language)) {
                language = getLanguage();
                if (!isSupportedLanguage(language))
                    language = defaultLang;
            }
            cLanguage = language;
            $location.search("hl", language);
            $cookies.language = language;
            $("html").attr("lang", language);
            localizeView(defaultUrl, language, "document", $(document), false, true);
            execConditions(language);
        };
        var initLanguage = function() {
            changeLanguage(isCrawler() ? defaultLang : getLanguage(), true);
        };
        var insertHrefLang = function(url) {
            var head = $("head");
            head.find("link[hreflang]").remove();
            head.append('<link rel="alternate" hreflang="x-default" href="' + url.replace("hl=" + cLanguage, "hl=" + defaultLang) + '"/>');
            for (var propertyKey in languages) {
                if (!languages.hasOwnProperty(propertyKey)
                || (propertyKey == defaultLang))
                    continue;
                head.append('<link rel="alternate" hreflang="' + propertyKey + '" href="' + url.replace("hl=" + cLanguage, "hl=" + propertyKey) + '"/>');
            }
        };
        var initBinding = function() {
            $rootScope.$on("$routeChangeSuccess", function(event, current, previous) {
                insertHrefLang($location.absUrl());
                if (current.localizeUrl === undefined)
                    return;
                current.locals.$template = localizeView(
                    current.localizeUrl,
                    cLanguage,
                    current.controller,
                    current.locals.$template,
                    false, false);
            });
            $rootScope.$watch(function(){ return $location.search() }, function(search){
                    if (search["hl"] === undefined)
                        $location.search("hl", cLanguage);
                    else if (cLanguage.toLowerCase() != search["hl"].toLowerCase())
                        changeLanguage(search["hl"]);
                    $route.reload();
                }
            );
        };
        var getCurrentLanguage = function() {
            return cLanguage;
        };
        var initialize = function(settings) {
            if (settings) {
                if (settings.optimizePrefix)
                    cSettings.optimizePrefix = settings.optimizePrefix;
                if (settings.preRenderAgent)
                    cSettings.preRenderAgent = settings.preRenderAgent;
            }
            initBinding();
            initLanguage();
        };
        return {
            initialize : initialize,
            changeLanguage: changeLanguage,
            localizeTemplate: localizeTemplate,
            getCurrentLanguage: getCurrentLanguage
        };
    }];
});
