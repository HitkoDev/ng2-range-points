System.register(['@angular/core'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1;
    var RangeBreakpoint, RangePoints;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            RangeBreakpoint = (function () {
                function RangeBreakpoint(value) {
                    this.value = value;
                    this.onChanged = new core_1.EventEmitter();
                }
                RangeBreakpoint.prototype.getLabel = function () {
                    return this.value + '';
                };
                RangeBreakpoint.prototype.onCollide = function (other) {
                };
                return RangeBreakpoint;
            }());
            exports_1("RangeBreakpoint", RangeBreakpoint);
            RangePoints = (function () {
                function RangePoints() {
                    this.focusItem = new core_1.EventEmitter();
                    this.holding = -1;
                }
                RangePoints.prototype.ngOnInit = function () {
                    var _this = this;
                    this._updateMinMax();
                    document.addEventListener('mouseout', function (evt) {
                        if (_this.holding < 0)
                            return;
                        if (evt.relatedTarget) {
                            var elName = evt.relatedTarget.nodeName.toLowerCase();
                            if (elName == 'body' || elName == 'html')
                                _this.release(evt);
                            return;
                        }
                        if (evt.target) {
                            var elName = evt.target.nodeName.toLowerCase();
                            if (elName == 'body' || elName == 'html')
                                _this.release(evt);
                            return;
                        }
                    });
                    document.addEventListener('mousemove', function (evt) { return _this.move(evt); });
                    document.addEventListener('mouseup', function (evt) { return _this.release(evt); });
                };
                RangePoints.prototype.hold = function (e) {
                    e.preventDefault();
                    var pos = (e.type == 'touchstart' ? e.changedTouches[0].clientX : e.clientX);
                    var value = this._getValue(pos);
                    var point = this._getPosition(value);
                    var off = 1;
                    var j = -1;
                    for (var i = 0; i < this.breakpoints.length; i++) {
                        var p = this._getPosition(this.breakpoints[i].value);
                        if (Math.abs(point - p) < off) {
                            off = Math.abs(point - p);
                            j = i;
                        }
                    }
                    if (off > this._getTreshold()) {
                        var rect = this.slider.nativeElement.getBoundingClientRect();
                        pos = (pos - rect.left) / rect.width;
                        if (value < this.minValue) {
                            var min = this._getBarMin(this.minValue);
                            var max = this.minValue;
                            for (var i = 0; i < 50; i++) {
                                value = (max + min) / 2;
                                var newPos = (value - this._getBarMin(value)) / (this._getBarMax(this.maxValue) - this._getBarMin(value));
                                if (newPos > pos) {
                                    max = value;
                                    min = this._getBarMin(value);
                                }
                                else {
                                    min = value;
                                }
                            }
                            value = this._round(value);
                        }
                        else if (value > this.maxValue) {
                            var min = this.maxValue;
                            var max = this._getBarMax(this.maxValue);
                            for (var i = 0; i < 50; i++) {
                                value = (max + min) / 2;
                                var newPos = (value - this._getBarMin(this.minValue)) / (this._getBarMax(value) - this._getBarMin(this.minValue));
                                if (newPos < pos) {
                                    min = value;
                                    max = this._getBarMax(value);
                                }
                                else {
                                    max = value;
                                }
                            }
                            value = this._round(value);
                        }
                        j = this.breakpoints.length;
                        this._createBreakpoint(value);
                        this._updateMinMax();
                    }
                    if (j >= 0)
                        this.focusItem.emit(this.breakpoints[j]);
                    this.holding = j;
                };
                RangePoints.prototype.release = function (e) {
                    e.preventDefault();
                    if (this.holding >= 0)
                        for (var i = this.breakpoints.length - 1; i >= 0; i--)
                            if ((this.breakpoints[i].value == this.breakpoints[this.holding].value) && (i != this.holding)) {
                                this.breakpoints[i].onCollide(this.breakpoints[this.holding]);
                                this.breakpoints.splice(i, 1);
                                this._updateMinMax();
                                break;
                            }
                    this.holding = -1;
                };
                RangePoints.prototype.move = function (e) {
                    if (this.holding < 0)
                        return;
                    e.preventDefault();
                    this.breakpoints[this.holding].value = this._getValue(e.type == 'mousemove' ? e.clientX : e.changedTouches[0].clientX);
                    this._updateMinMax();
                };
                RangePoints.prototype._getValue = function (x) {
                    var rect = this.slider.nativeElement.getBoundingClientRect();
                    var relative = (x - rect.left) / rect.width;
                    relative = Math.min(1, Math.max(0, relative)); // snap to range [0 .. 1]
                    var value = this._round(this._getBarMin(this.minValue) + relative * (this._getBarMax(this.maxValue) - this._getBarMin(this.minValue)));
                    return value;
                };
                RangePoints.prototype._getPosition = function (value) {
                    return (value - this._getBarMin(this.minValue)) / (this._getBarMax(this.maxValue) - this._getBarMin(this.minValue));
                };
                RangePoints.prototype.getIndex = function (value) {
                    return Math.round(1000 * this._getPosition(value));
                };
                RangePoints.prototype._getTreshold = function () {
                    var rect = this.slider.nativeElement.getBoundingClientRect();
                    return this.options.threshold / rect.width;
                };
                RangePoints.prototype._round = function (val) {
                    return parseFloat((this.options.step * Math.round(val / this.options.step)).toPrecision(10));
                };
                RangePoints.prototype._getBarMax = function (value) {
                    if (typeof this.options.max == "number")
                        return Math.min(this.options.max, value + this.options.offset);
                    return value + this.options.offset;
                };
                RangePoints.prototype._getBarMin = function (value) {
                    if (typeof this.options.min == "number")
                        return Math.max(this.options.min, value - this.options.offset);
                    return value - this.options.offset;
                };
                RangePoints.prototype._updateMinMax = function () {
                    if (this.breakpoints.length < 1) {
                        if (typeof this.options.min == "number" && typeof this.options.max == "number")
                            return this.minValue = this.maxValue = (this.options.min + this.options.max) / 2;
                        if (typeof this.options.min == "number")
                            return this.minValue = this.maxValue = this.options.min;
                        if (typeof this.options.max == "number")
                            return this.minValue = this.maxValue = this.options.max;
                        return this.minValue = this.maxValue = 0;
                    }
                    var min = this.breakpoints[0].value, max = min;
                    for (var i = 1; i < this.breakpoints.length; i++) {
                        if (this.breakpoints[i].value < min)
                            min = this.breakpoints[i].value;
                        if (this.breakpoints[i].value > max)
                            max = this.breakpoints[i].value;
                    }
                    this.minValue = min;
                    this.maxValue = max;
                };
                RangePoints.prototype._createBreakpoint = function (value) {
                    var _this = this;
                    var bp;
                    if (typeof this.options.breakPointCreator == 'function')
                        bp = this.options.breakPointCreator(value);
                    else
                        bp = this.breakpoints.push(new RangeBreakpoint(value));
                    bp.onChanged.subscribe(function () { return _this._updateMinMax(); });
                };
                __decorate([
                    core_1.ViewChild('slider'), 
                    __metadata('design:type', Object)
                ], RangePoints.prototype, "slider", void 0);
                __decorate([
                    core_1.Input(), 
                    __metadata('design:type', Object)
                ], RangePoints.prototype, "options", void 0);
                __decorate([
                    core_1.Input(), 
                    __metadata('design:type', Object)
                ], RangePoints.prototype, "breakpoints", void 0);
                __decorate([
                    core_1.Output(), 
                    __metadata('design:type', core_1.EventEmitter)
                ], RangePoints.prototype, "focusItem", void 0);
                RangePoints = __decorate([
                    core_1.Component({
                        selector: "ng2-range-points",
                        moduleId: __moduleName,
                        templateUrl: 'ng2-range-points.html',
                        styleUrls: ['ng2-range-points.css']
                    }), 
                    __metadata('design:paramtypes', [])
                ], RangePoints);
                return RangePoints;
            }());
            exports_1("RangePoints", RangePoints);
        }
    }
});

//# sourceMappingURL=ng2-range-points.js.map
