(function ($) {
  Drupal.behaviors.fpa_prepare = function (context) {
    var module_id, new_module_id;
    $("#permissions tbody tr", context).each(function () {
      new_module_id = $(this).find("td.module").attr("id");
      if (new_module_id) {
        module_id = new_module_id;
      }
      else {
        $(this).data('fpa_module', module_id);
      }
    });
  };
  Drupal.behaviors.fpa = function (context) {
    var rows = $("#permissions", context)
    .find("td.permission")
    .filter(function () {
      return this.innerHTML.indexOf(Drupal.settings.fpa_perm) != -1;
    }).parent()
    .removeClass('odd even')
    .filter(":even").addClass('odd').end()
    .filter(":odd").addClass('even').end()
    .addClass('fpa_show')
    .each(function () {
      $('#'+$(this).data('fpa_module'), context).parent().addClass('fpa_show');
    })
    ;
  };
  Drupal.behaviors.fpa_modalframe = function (context) {
    $('a.fpa_modalframe', context).click(function (e) {
      e.preventDefault();
      e.stopPropagation();
      Drupal.modalFrame.open({
        url: $(this).attr('href'),
        draggable: false
      });
    });
  };
})(jQuery);

