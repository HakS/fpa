(function ($) {
  var fpa = {};
  
  fpa.prepare = function (context) {
    var module_id, new_module_id;
    
    fpa.table = $("#permissions", context);
    fpa.rows = fpa.table.find('tbody tr');
    fpa.perms = fpa.rows.find('td.permission');
    
    fpa.rows
      .each(function () {
        new_module_id = $(this).find("td.module").attr("id");
        if (new_module_id) {
          module_id = new_module_id;
        }
        else {
          $(this).data('fpa_module', module_id);
        }
      });
    $('<input id="fpa_search" type="text" class="form-text" />')
      .insertBefore(fpa.table.parent())
      .keypress(function (e) {
        //prevent enter from submitting form
        if (e.which == 13) {
          return false;
        }
      })
      .keyup(function (e) {
        var $val = $(this).val();
        if ($val != '') {
          fpa.rows.css('display', 'none');
          Drupal.settings.fpa.perm = $val;
          fpa.filter(window.document);
        }
        else {
          fpa.rows
            .css('display', '')
            .removeClass('odd even')
            .filter(":even").addClass('odd').end()
            .filter(":odd").addClass('even').end();
        }
      })
      .wrap('<div class="form-item" class="form-type-textfield" />')
      .before('<label for="fpa_search">Search:</label>')
      .after('<div class="description">Start typing and only permissions that contain the entered text will be displayed.</div>')
      .val(Drupal.settings.fpa.perm);
  };
  
  fpa.filter = function () {
    var perm_labels = {};
    if (typeof Drupal.settings.fpa.perm != 'undefined' && Drupal.settings.fpa.perm.length > 0) {
      fpa.rows.css('display', 'none');
      fpa.perms
        .filter(function () {
          return $(this).text().toLowerCase().indexOf(Drupal.settings.fpa.perm.toLowerCase()) != -1;
        }).parent()
        .css('display', '')
        .each(function () {
          perm_labels[$(this).data('fpa_module')] = 1;
        });
      for (var i in perm_labels) {
        $('#' + i).parent().css('display', '');
      }
      fpa.rows
        .filter(':visible').removeClass('odd even')
        .filter(":even").addClass('odd').end()
        .filter(":odd").addClass('even').end();
    }
  };
  
  fpa.modalframe = function (context) {
    $('a.fpa_modalframe', context).click(function (e) {
      e.preventDefault();
      e.stopPropagation();
      Drupal.modalFrame.open({
        url: $(this).attr('href'),
        draggable: false
      });
    });
  };
  
  Drupal.behaviors.fpa = {
    attach: function (context) {
      fpa.prepare(context);
      fpa.filter();
      fpa.modalframe(context);
    }
  };
})(jQuery);
