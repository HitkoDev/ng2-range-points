import { Component, Output, EventEmitter, ViewChild, OnInit, Input } from '@angular/core'
import { Observable } from 'rxjs/Observable'

export interface RangePointsOptions {
    offset: number
    step: number
    threshold: number
    min?: number
    max?: number
    th?: any
    breakPointCreator?: (value: number) => RangeBreakpoint
}

export class RangeBreakpoint {

    onChanged = new EventEmitter()

    constructor(
        public value: number
    ) { }

    getLabel(): string {
        return this.value + ''
    }

    onCollide(other: RangeBreakpoint): void {

    }

}

declare var __moduleName: string

@Component({
    selector: "ng2-range-points",
    moduleId: __moduleName,
    templateUrl: 'ng2-range-points.html',
    styleUrls: ['ng2-range-points.css']
})
export class RangePoints implements OnInit {

    @ViewChild('slider') slider

    @Input() options
    @Input() breakpoints
    @Output() focusItem: EventEmitter<any> = new EventEmitter()

    holding = -1
    maxValue: number
    minValue: number

    ngOnInit() {
        this._updateMinMax()
        document.addEventListener('mouseout', (evt) => {
            if (this.holding < 0) return

            if (evt.relatedTarget) {
                let elName = (<HTMLElement>evt.relatedTarget).nodeName.toLowerCase()
                if (elName == 'body' || elName == 'html') this.release(evt)
                return
            }

            if (evt.target) {
                let elName = (<HTMLElement>evt.target).nodeName.toLowerCase()
                if (elName == 'body' || elName == 'html') this.release(evt)
                return
            }
        })
        document.addEventListener('mousemove', (evt) => this.move(evt))
        document.addEventListener('mouseup', (evt) => this.release(evt))
    }

    hold(e) {
        e.preventDefault()
        let pos = (e.type == 'touchstart' ? e.changedTouches[0].clientX : e.clientX)
        let value = this._getValue(pos)

        let point = this._getPosition(value)
        let off = 1
        let j = -1

        for (let i = 0; i < this.breakpoints.length; i++) {
            let p = this._getPosition(this.breakpoints[i].value)
            if (Math.abs(point - p) < off) {
                off = Math.abs(point - p)
                j = i
            }
        }
        if (off > this._getTreshold()) {
            let rect = this.slider.nativeElement.getBoundingClientRect()
            pos = (pos - rect.left) / rect.width

            if (value < this.minValue) {
                let min = this._getBarMin(this.minValue)
                let max = this.minValue
                for (let i = 0; i < 50; i++) {
                    value = (max + min) / 2
                    let newPos = (value - this._getBarMin(value)) / (this._getBarMax(this.maxValue) - this._getBarMin(value))
                    if (newPos > pos) {
                        max = value
                        min = this._getBarMin(value)
                    } else {
                        min = value
                    }
                }
                value = this._round(value)
            } else if (value > this.maxValue) {
                let min = this.maxValue
                let max = this._getBarMax(this.maxValue)
                for (let i = 0; i < 50; i++) {
                    value = (max + min) / 2
                    let newPos = (value - this._getBarMin(this.minValue)) / (this._getBarMax(value) - this._getBarMin(this.minValue))
                    if (newPos < pos) {
                        min = value
                        max = this._getBarMax(value)
                    } else {
                        max = value
                    }
                }
                value = this._round(value)
            }

            j = this.breakpoints.length
            this._createBreakpoint(value)
            this._updateMinMax()
        }

        if (j >= 0) this.focusItem.emit(this.breakpoints[j])

        this.holding = j
    }

    release(e) {
        e.preventDefault()
        if (this.holding >= 0)
            for (let i = this.breakpoints.length - 1; i >= 0; i--)
                if ((this.breakpoints[i].value == this.breakpoints[this.holding].value) && (i != this.holding)) {
                    this.breakpoints[i].onCollide(this.breakpoints[this.holding])
                    this.breakpoints.splice(i, 1)
                    this._updateMinMax()
                    break
                }

        this.holding = -1
    }

    move(e) {
        if (this.holding < 0) return
        e.preventDefault()
        this.breakpoints[this.holding].value = this._getValue(e.type == 'mousemove' ? e.clientX : e.changedTouches[0].clientX)
        this._updateMinMax()
    }

    _getValue(x) {
        let rect = this.slider.nativeElement.getBoundingClientRect()
        let relative = (x - rect.left) / rect.width
        relative = Math.min(1, Math.max(0, relative))   // snap to range [0 .. 1]
        let value = this._round(this._getBarMin(this.minValue) + relative * (this._getBarMax(this.maxValue) - this._getBarMin(this.minValue)))
        return value
    }

    _getPosition(value) {
        return (value - this._getBarMin(this.minValue)) / (this._getBarMax(this.maxValue) - this._getBarMin(this.minValue))
    }

    getIndex(value) {
        return Math.round(1000 * this._getPosition(value))
    }

    _getTreshold() {
        let rect = this.slider.nativeElement.getBoundingClientRect()
        return this.options.threshold / rect.width
    }

    _round(val) {
        return parseFloat((this.options.step * Math.round(val / this.options.step)).toPrecision(10))
    }

    _getBarMax(value) {
        if (typeof this.options.max == "number") return Math.min(this.options.max, value + this.options.offset)
        return value + this.options.offset
    }

    _getBarMin(value) {
        if (typeof this.options.min == "number") return Math.max(this.options.min, value - this.options.offset)
        return value - this.options.offset
    }

    _updateMinMax() {
        if (this.breakpoints.length < 1) {
            if (typeof this.options.min == "number" && typeof this.options.max == "number")
                return this.minValue = this.maxValue = (this.options.min + this.options.max) / 2

            if (typeof this.options.min == "number") return this.minValue = this.maxValue = this.options.min

            if (typeof this.options.max == "number") return this.minValue = this.maxValue = this.options.max

            return this.minValue = this.maxValue = 0
        }

        let min = this.breakpoints[0].value, max = min
        for (let i = 1; i < this.breakpoints.length; i++) {
            if (this.breakpoints[i].value < min)
                min = this.breakpoints[i].value
            if (this.breakpoints[i].value > max)
                max = this.breakpoints[i].value
        }
        this.minValue = min
        this.maxValue = max
    }

    _createBreakpoint(value: number) {
        let bp: RangeBreakpoint
        if (typeof this.options.breakPointCreator == 'function')
            bp = this.options.breakPointCreator(value)
        else
            bp = this.breakpoints.push(new RangeBreakpoint(value))

        bp.onChanged.subscribe(() => this._updateMinMax())
    }

}