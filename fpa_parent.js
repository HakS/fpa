jQuery(function ($) {
  $('#fpa_modal_link').click(function () {
    Drupal.modalFrame.open({
      url: $(this).attr('href'),
      draggable: false,
      width: 950,
      height: 600,
      autoFit: false,
      onLoad: function (self, iFrameWindow, iFrameDocument) {
        var rows = $("#permissions", iFrameDocument)
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
        
      }
    });
    return false;
  });
});
