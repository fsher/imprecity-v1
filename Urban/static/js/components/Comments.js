import jQuery from 'jquery';
import globals from "../globals";

window.$ = window.jQuery = jQuery;

export default class Comments {
    constructor(selector, amount) {
        this._selector = selector;
        this._amount = amount;
        this._data = null;

        this.loadData();
    }

    loadData() {
        $.ajax({
            url: "api/mark/comments",
            method: "GET",
            data: {
                amount: this._amount
            }
        }).done((data) => {
            this._data = data;

            this.render();
        });
    }

    render() {
        if (this._data) {
            let ar = this._data["comments"];

            for (let i = 0; i < ar.length; i++) {
                let item = document.createElement("div");
                item.className = "wrap__comments-item";

                let name = null;
                if (!(ar[i]["user_id"]["first_name"]) && !(ar[i]["user_id"]["last_name"])) name = "No Name";
                else name = ar[i]["user_id"]["first_name"] + " " + ar[i]["user_id"]["last_name"];

                item.innerHTML = '<img src="' + globals.MARKERS[ar[i]["type"]]["url"] + '" class="wrap__comments-img" alt="">';
                item.innerHTML += '<div class="wrap__comments-content"><div class="wrap__comments-content-name">' + name + '</div><div class="wrap__comments-content-text"><p>' + (ar[i]["text"] ? ar[i]["text"] : "-") + '</p></div></div>';

                document.querySelector(this._selector).appendChild(item);
            }
        }

    }
}