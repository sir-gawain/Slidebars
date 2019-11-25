/*!
 * Slidebars - A jQuery Framework for Off-Canvas Menus and Sidebars
 * Version: 2 Development
 * Url: http://www.adchsm.com/slidebars/
 * Author: Adam Charles Smith
 * Author url: http://www.adchsm.com/
 * License: MIT
 * License url: http://www.adchsm.com/slidebars/license/
 */
var slidebars = function() {
    var canvas = $("[data-canvas]"), offCanvas = {}, init = false, registered = false, sides = [ "top", "right", "bottom", "left" ], styles = [ "reveal", "push", "overlay", "shift" ], getAnimationProperties = function(id) {
        var elements = $(), amount = "0px, 0px", duration = parseFloat(offCanvas[id].element.css("transitionDuration"), 10) * 1e3;
        if (offCanvas[id].style === "reveal" || offCanvas[id].style === "push" || offCanvas[id].style === "shift") {
            elements = elements.add(canvas);
        }
        if (offCanvas[id].style === "push" || offCanvas[id].style === "overlay" || offCanvas[id].style === "shift") {
            elements = elements.add(offCanvas[id].element);
        }
        if (offCanvas[id].active) {
            if (offCanvas[id].side === "top") {
                amount = "0px, " + offCanvas[id].element.css("height");
            } else if (offCanvas[id].side === "right") {
                amount = "-" + offCanvas[id].element.css("width") + ", 0px";
            } else if (offCanvas[id].side === "bottom") {
                amount = "0px, -" + offCanvas[id].element.css("height");
            } else if (offCanvas[id].side === "left") {
                amount = offCanvas[id].element.css("width") + ", 0px";
            }
        }
        return {
            elements: elements,
            amount: amount,
            duration: duration
        };
    }, registerSlidebar = function(id, side, style, element) {
        if (isRegisteredSlidebar(id)) {
            throw "Error registering Slidebar, a Slidebar with id '" + id + "' already exists.";
        }
        offCanvas[id] = {
            id: id,
            side: side,
            style: style,
            element: element,
            active: false
        };
    }, isRegisteredSlidebar = function(id) {
        if (offCanvas.hasOwnProperty(id)) {
            return true;
        } else {
            return false;
        }
    };
    this.init = function(callback) {
        if (init) {
            throw "Slidebars has already been initialized.";
        }
        if (!registered) {
            $("[data-off-canvas]").each(function() {
                var parameters = $(this).attr("data-off-canvas").split(" ", 3);
                if (!parameters || !parameters[0] || sides.indexOf(parameters[1]) === -1 || styles.indexOf(parameters[2]) === -1) {
                    throw "Error registering Slidebar, please specifiy a valid id, side and style'.";
                }
                registerSlidebar(parameters[0], parameters[1], parameters[2], $(this));
            });
            registered = true;
        }
        init = true;
        this.css();
        $(events).trigger("init");
        if (typeof callback === "function") {
            callback();
        }
    };
    this.exit = function(callback) {
        if (!init) {
            throw "Slidebars hasn't been initialized.";
        }
        var exit = function() {
            init = false;
            $(events).trigger("exit");
            if (typeof callback === "function") {
                callback();
            }
        };
        if (this.getActiveSlidebar()) {
            this.close(exit);
        } else {
            exit();
        }
    };
    this.css = function(callback) {
        if (!init) {
            throw "Slidebars hasn't been initialized.";
        }
        for (var id in offCanvas) {
            if (isRegisteredSlidebar(id)) {
                var offset;
                if (offCanvas[id].side === "top" || offCanvas[id].side === "bottom") {
                    offset = offCanvas[id].element.css("height");
                } else {
                    offset = offCanvas[id].element.css("width");
                }
                if (offCanvas[id].style === "push" || offCanvas[id].style === "overlay" || offCanvas[id].style === "shift") {
                    offCanvas[id].element.css("margin-" + offCanvas[id].side, "-" + offset);
                }
            }
        }
        if (this.getActiveSlidebar()) {
            this.open(this.getActiveSlidebar());
        }
        $(events).trigger("css");
        if (typeof callback === "function") {
            callback();
        }
    };
    this.open = function(id, callback) {
        if (!init) {
            throw "Slidebars hasn't been initialized.";
        }
        if (!id) {
            throw "You must pass a Slidebar id.";
        }
        if (!isRegisteredSlidebar(id)) {
            throw "Error opening Slidebar, there is no Slidebar with id '" + id + "'.";
        }
        var open = function() {
            offCanvas[id].active = true;
            offCanvas[id].element.css("display", "block");
            $(events).trigger("opening", [ offCanvas[id].id ]);
            var animationProperties = getAnimationProperties(id);
            animationProperties.elements.css({
                "transition-duration": animationProperties.duration + "ms",
                transform: "translate(" + animationProperties.amount + ")"
            });
            setTimeout(function() {
                $(events).trigger("opened", [ offCanvas[id].id ]);
                if (typeof callback === "function") {
                    callback();
                }
            }, animationProperties.duration);
        };
        if (this.getActiveSlidebar() && this.getActiveSlidebar() !== id) {
            this.close(open);
        } else {
            open();
        }
    };
    this.close = function(id, callback) {
        if (typeof id === "function") {
            callback = id;
            id = null;
        }
        if (!init) {
            throw "Slidebars hasn't been initialized.";
        }
        if (id && !isRegisteredSlidebar(id)) {
            throw "Error closing Slidebar, there is no Slidebar with id '" + id + "'.";
        }
        if (!id) {
            id = this.getActiveSlidebar();
        }
        if (id && offCanvas[id].active) {
            offCanvas[id].active = false;
            $(events).trigger("closing", [ offCanvas[id].id ]);
            var animationProperties = getAnimationProperties(id);
            animationProperties.elements.css("transform", "");
            setTimeout(function() {
                animationProperties.elements.css("transition-duration", "");
                offCanvas[id].element.css("display", "");
                $(events).trigger("closed", [ offCanvas[id].id ]);
                if (typeof callback === "function") {
                    callback();
                }
            }, animationProperties.duration);
        }
    };
    this.toggle = function(id, callback) {
        if (!init) {
            throw "Slidebars hasn't been initialized.";
        }
        if (!id) {
            throw "You must pass a Slidebar id.";
        }
        if (!isRegisteredSlidebar(id)) {
            throw "Error toggling Slidebar, there is no Slidebar with id '" + id + "'.";
        }
        if (offCanvas[id].active) {
            this.close(id, function() {
                if (typeof callback === "function") {
                    callback();
                }
            });
        } else {
            this.open(id, function() {
                if (typeof callback === "function") {
                    callback();
                }
            });
        }
    };
    this.isActive = function() {
        return init;
    };
    this.isActiveSlidebar = function(id) {
        if (!init) {
            throw "Slidebars hasn't been initialized.";
        }
        if (!id) {
            throw "You must provide a Slidebar id.";
        }
        if (!isRegisteredSlidebar(id)) {
            throw "Error retrieving Slidebar, there is no Slidebar with id '" + id + "'.";
        }
        return offCanvas[id].active;
    };
    this.getActiveSlidebar = function() {
        if (!init) {
            throw "Slidebars hasn't been initialized.";
        }
        var active = false;
        for (var id in offCanvas) {
            if (isRegisteredSlidebar(id)) {
                if (offCanvas[id].active) {
                    active = offCanvas[id].id;
                    break;
                }
            }
        }
        return active;
    };
    this.getSlidebars = function() {
        if (!init) {
            throw "Slidebars hasn't been initialized.";
        }
        var slidebarsArray = [];
        for (var id in offCanvas) {
            if (isRegisteredSlidebar(id)) {
                slidebarsArray.push(offCanvas[id].id);
            }
        }
        return slidebarsArray;
    };
    this.getSlidebar = function(id) {
        if (!init) {
            throw "Slidebars hasn't been initialized.";
        }
        if (!id) {
            throw "You must pass a Slidebar id.";
        }
        if (!isRegisteredSlidebar(id)) {
            throw "Error retrieving Slidebar, there is no Slidebar with id '" + id + "'.";
        }
        return offCanvas[id];
    };
    this.events = {};
    var events = this.events;
    $(window).on("resize", this.css.bind(this));
};

if (typeof define !== "undefined" && define.amd) {
    define([], function() {
        return slidebars;
    });
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = slidebars;
}