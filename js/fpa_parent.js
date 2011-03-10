(function ($) {
  Drupal.behaviors.fpa = function (context) {
    var rows = $("#permissions", context)
    .find("td.permission")
    .filter(function () {
      return this.innerHTML.indexOf(Drupal.settings.fpa_perm) != -1;
    }).parent()
    .removeClass('odd even')
    .filter(":even").addClass('odd').end()
    .filter(":odd").addClass('even').end()
    .addClass('fpa_show');
    
    if (typeof($.fn.prevUntil) == "function") {
      rows.each(function(index) {
        
          var module = $(this).prevUntil("tr:has(td.module)");
          if (module.length == 0) { //prevUntil will be empty if module row was immediate before
            module = module.end();
          }
          module.prev("tr:has(td.module)").addClass('fpa_show');
      });
    }
  };
})(jQuery);