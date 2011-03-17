(function ($) {
  var fpa_table,
      fpa_rows,
      fpa_perms;
  
  Drupal.behaviors.fpa_prepare = function (context) {
    var module_id, new_module_id, timeout;
    
    fpa_table = $("#permissions", context);
    fpa_rows = fpa_table.find('tbody tr');
    fpa_perms = fpa_rows.find('td.permission');
    
    fpa_rows.each(function () {
      new_module_id = $(this).find("td.module").attr("id");
      if (new_module_id) {
        module_id = new_module_id;
      }
      else {
        $(this).data('fpa_module', module_id);
      }
    });
    $('<input id="fpa_search" type="text" />')
    .prependTo('#user-admin-perm')
    .keyup(function (e) {
      var $val = $(this).val();
      if ($val != '') {
        fpa_rows.filter(".fpa_show").removeClass('fpa_show');
        Drupal.settings.fpa_perm = $val;
        Drupal.behaviors.fpa(window.document);
      }
      else {
        fpa_table.removeClass('fpa_enabled');
        fpa_rows.removeClass('odd even')
        .filter(":even").addClass('odd').end()
        .filter(":odd").addClass('even').end();
      }
    })
    .wrap('<div class="form-item" />')
    .before('<label for="fpa_search">Search:</label>')
    .after('<div class="description">Start typing and only permissions that contain the entered text will be displayed.</div>')
    .val(Drupal.settings.fpa_perm);
  };
  Drupal.behaviors.fpa = function (context) {
    if (typeof Drupal.settings.fpa_perm != 'undefined') {
      fpa_table.addClass('fpa_enabled');
      fpa_perms.filter(function () {
        return this.innerHTML.toLowerCase().indexOf(Drupal.settings.fpa_perm.toLowerCase()) != -1;
      }).parent()
      .addClass('fpa_show')
      .each(function () {
        $('#'+$(this).data('fpa_module')).parent().addClass('fpa_show');
      });
      fpa_rows.filter('.fpa_show').removeClass('odd even')
      .filter(":even").addClass('odd').end()
      .filter(":odd").addClass('even').end();
    }
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

