class MarkerCounter {
    constructor(selector, amount, options) {
        this._hideButton = options.counterOnly || false;

        this.BUTTON_CLASS = "wrap__sidebar-heatmap-button";
        this.MAX_AMOUNT = 0;

        this._selector = selector;
        this._disabledState = amount < this.MAX_AMOUNT;
        this._realCounterValue = amount;
        this._counterValue = 0;
        //this._setMarkerCounter(this._realCounterValue);


        /*
        this._counter = document.createElement("h5");
        this._counter.className = "wrap__sidebar-heatmap-header";
        this._counter.innerHTML = "Счетчик эмоций";
        this._selector.appendChild(this._counter);

        this._counter = document.createElement("div");
        this._counter.className = "wrap__sidebar-heatmap-counter";
        this._counter.innerHTML = this._counterValue + "/" + this.MAX_AMOUNT;
        this._selector.appendChild(this._counter);
        */

        if (!this._hideButton) {
            let toggleBox = document.createElement("div");
            toggleBox.className = "wrap__sidebar-heatmap-toggle";
            toggleBox.innerHTML = this._disabledState ? '<button class="' + this.BUTTON_CLASS + '--disabled"><img class="wrap__sidebar-heatmap-img" src="/static/img/my_heatmap.png" alt=""><div class="wrap__sidebar-heatmap-button-tooltip">Показать тепловую карту</div></button>' : '<button class="' + this.BUTTON_CLASS + '"><img class="wrap__sidebar-heatmap-img" src="/static/img/my_heatmap.png" alt=""><div class="wrap__sidebar-heatmap-button-tooltip">Показать тепловую карту</div></button>';
            this._selector.appendChild(toggleBox);

            this._buttonHasEventListener = false;
            this._buttonEvent = null;
        }

    }

    isDisabled() {
        return this._disabledState;
    }

    toggle() {
        if (!this._hideButton) {
            let buttonClassNameRemove = !this._disabledState ? this.BUTTON_CLASS + "--disabled" : this.BUTTON_CLASS;
            let buttonClassNameAdd = !this._disabledState ? this.BUTTON_CLASS : this.BUTTON_CLASS + "--disabled";

            document.querySelector("." + buttonClassNameRemove).classList.add(buttonClassNameAdd);
            document.querySelector("." + buttonClassNameRemove).classList.remove(buttonClassNameRemove);
        }

    }

    getButtonDom() {
        if (this._hideButton) return null;

        return this._disabledState ? document.querySelector("." + this.BUTTON_CLASS + "--disabled") : document.querySelector("." + this.BUTTON_CLASS);
    }

    getTooltip() {
        return document.querySelector(".wrap__sidebar-heatmap-button-tooltip");
    }

    addButtonEventListener(event) {
        if (!this._buttonHasEventListener && !this._hideButton) {
            document.querySelector("." + this.BUTTON_CLASS).addEventListener("click", event);
            this._buttonHasEventListener = true;
            this._buttonEvent = event;
        }
    }

    _setMarkerCounter(amount) {
        if (amount > this.MAX_AMOUNT) this._counterValue = this.MAX_AMOUNT;
        else this._counterValue = amount >= 0 ? amount : 0;
    }

    inc(callback) {
        this._realCounterValue++;
        //this._setMarkerCounter(this._realCounterValue);
        this._changeStateIfNeeded();
        //this._updateDomCounter();

        if (typeof callback === "function") callback();
        return this.isDisabled();
    }

    dec(callback) {
        this._realCounterValue--;
        //this._setMarkerCounter(this._realCounterValue);
        this._changeStateIfNeeded();
        //this._updateDomCounter();

        if (this._realCounterValue < this.MAX_AMOUNT && !this._hideButton) {
            this.getButtonDom().removeEventListener("click", this._buttonEvent);
            this._buttonHasEventListener = false;
            this._buttonEvent = null;
        }

        if (typeof callback === "function") callback();

        return this.isDisabled();
    }

    getMarkerCounter() {
        return this._counterValue;
    }

    getRealCounterValue() {
        return this._realCounterValue;
    }

    setRealCounterValue(amount) {
        this._realCounterValue = amount;
    }

    _changeStateIfNeeded() {
        let prevState = this._disabledState;

        if (this._realCounterValue < this.MAX_AMOUNT) this._disabledState = true;
        else this._disabledState = false;

        if (prevState != this._disabledState) this.toggle();
    }

    _updateDomCounter() {
        this._counter.innerHTML = this._counterValue + "/" + this.MAX_AMOUNT;
    }

}

export default MarkerCounter;