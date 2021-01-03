var textarea = document.getElementById('message-input');
function autosize() {
    var el = this;
    setTimeout(function () {
        el.style.cssText = 'height:auto; padding:0';
        el.style.cssText = 'height:' + el.scrollHeight + 'px';
        console.log("qew");
    }, 0);
}

textarea.addEventListener('keydown', autosize);