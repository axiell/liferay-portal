(function ($) {
  $(document).ready(function () {
    if (!Liferay.ThemeDisplay.isSignedIn()) {
      var dockbarSelector = 'div#sign-in, div.sign-in, span.sign-in';

      var elementDockbar = $(dockbarSelector);
      if (elementDockbar.length > 0) {
        elementDockbar.hide();

        $(document).keydown(function (event) {
          event = $.event.fix(event);
          // Ctrl+Shift+l
          if (event.shiftKey && event.ctrlKey && event.which === 76) {
            var elementDockbar = $(dockbarSelector);
            elementDockbar.toggle();
            return false;
          } else {
            return true;
          }
        });
      }
    }
  });
})(jQuery);

