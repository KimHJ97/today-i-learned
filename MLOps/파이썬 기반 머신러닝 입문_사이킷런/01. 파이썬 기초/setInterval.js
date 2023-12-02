function ClickConnect() {
    var buttons = document.querySelectorAll("colab-dialog.yes-no-dialog paper-button#cancel");
    buttons.forEach(function(btn) { btn.click(); });
    console.log("1분마다 자동 재연결");
    document.querySelector("colab-toolbar-button#connect").click();
 }
 setInterval(ClickConnect,1000*60);