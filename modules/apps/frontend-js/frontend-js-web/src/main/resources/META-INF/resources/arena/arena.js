(function () {
    document.addEventListener('DOMContentLoaded', function (event) {
        if (!Liferay.ThemeDisplay.isSignedIn()) {
            var dockbarSelector = 'div#sign-in, div.sign-in, span.sign-in';
            var elementDockbar = document.querySelector(dockbarSelector);
            if (elementDockbar) {
                elementDockbar.style.display = 'none';
                var eventTarget = event.target;
                eventTarget.addEventListener('keydown', function (event) {
                    // Ctrl+Shift+l
                    if (event.shiftKey && event.ctrlKey && event.which === 76) {
                        if (elementDockbar.style.display === "none") {
                            elementDockbar.style.display = "block";
                        } else {
                            elementDockbar.style.display = "none";
                        }
                        return false;
                    } else {
                        return true;
                    }
                });
            }
        }
    });
})();

