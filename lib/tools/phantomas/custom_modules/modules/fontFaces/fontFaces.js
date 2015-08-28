/**
 * List all the @font-face declared in CSS. Will be used by YLT to check if a WOFF2 font was provided.
 */

exports.version = '0.1';

exports.module = function(phantomas) {
    'use strict';

    phantomas.setMetric('javascriptExecutionTree');

    // save data
    phantomas.on('report', function() {
        phantomas.log('Listing all @font-faces');

        phantomas.evaluate(function() {
            (function(phantomas) {
                
                function findFontFaceRules(styleSheet) {
                    if (!styleSheet.cssRules) {
                        return [];
                    }

                    var pattern = /^@font-face/;
                    return Array.prototype.filter.call(styleSheet.cssRules, function(rule) {
                        return !!(rule.cssText.match(pattern));
                    });
                }

                function findFontName(fontFaceRule) {
                    var pattern = /font-family\s?:\s?([^\s;}]*)/;
                    var result = pattern.exec(fontFaceRule.cssText);
                    return result[1] || '';
                }

                function findFontFormats(fontFaceRule) {
                    var results = {};

                    var pattern = /url\(([^\)\s]*)\)( format\(([^\)\s]*)\))?/g;
                    var formats = fontFaceRule.cssText.match(pattern);
                    if (formats) {
                        formats.forEach(function(format) {
                            pattern.lastIndex = 0;
                            var details = pattern.exec(format);
                            var formatName = details[3] || 'default';
                            var url = details[1];
                            results[formatName] = url;
                        });
                    }
                    return results;
                }

                var fontFaces = [];
                Array.prototype.forEach.call(document.styleSheets, function(styleSheet) {
                    fontFaces = fontFaces.concat(findFontFaceRules(styleSheet));
                });

                var fonts = [];
                fontFaces.forEach(function(fontFace) {
                    var result = {
                        family: findFontName(fontFace),
                        formats: findFontFormats(fontFace)
                    };
                    if (fontFace.parentStyleSheet.href) {
                        result.css = fontFace.parentStyleSheet.href;
                    }
                    fonts.push(result);
                });

                phantomas.setMetric('fontFaces', true, true);
                phantomas.addOffender('fontFaces', JSON.stringify(fonts));

            })(window.__phantomas);
        });
    });
};
