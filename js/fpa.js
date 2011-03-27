(function ($) {
  var fpa_table,
      fpa_rows,
      fpa_perms;
  
  Drupal.behaviors.fpa_prepare = {
    attach: function (context) {
      var module_id, new_module_id, timeout;
      
      fpa_table = $("#permissions", context);
      fpa_rows = fpa_table.find('tbody tr');
      fpa_perms = fpa_rows.find('td.permission');
      
      fpa_rows
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
        .insertBefore(fpa_table.parent())
        .keypress(function (e) {
          //prevent enter from submitting form
          if (e.which == 13) {
            return false;
          }
        })
        .keyup(function (e) {
          var $val = $(this).val();
          if ($val != '') {
            fpa_rows.css('display', 'none');
            Drupal.settings.fpa_perm = $val;
            Drupal.behaviors.fpa.attach(window.document);
          }
          else {
            fpa_rows
              .css('display', '')
              .removeClass('odd even')
              .filter(":even").addClass('odd').end()
              .filter(":odd").addClass('even').end();
          }
        })
        .wrap('<div class="form-item form-type-textfield" />')
        .before('<label for="fpa_search">Search:</label>')
        .after('<div class="description">Start typing and only permissions that contain the entered text will be displayed.</div>')
        .val(Drupal.settings.fpa_perm);
    }
  };
  Drupal.behaviors.fpa = {
    attach: function (context) {
      var perm_labels = {};
      if (typeof Drupal.settings.fpa_perm != 'undefined' && Drupal.settings.fpa_perm.length > 0) {
        fpa_rows.css('display', 'none');
        var ti = new Date().getTime();
        fpa_perms
          .filter(function () {
            return $(this).text().toLowerCase().indexOf(Drupal.settings.fpa_perm.toLowerCase()) != -1;
          }).parent()
          .css('display', '')
          .each(function () {
            perm_labels[$(this).data('fpa_module')] = 1;
          });
        console.log(new Date().getTime() - ti);
        for (var i in perm_labels) {
          $('#' + i).parent().css('display', '');
        }
        fpa_rows
          .filter(':visible').removeClass('odd even')
          .filter(":even").addClass('odd').end()
          .filter(":odd").addClass('even').end();
      }
    }
  };
  Drupal.behaviors.fpa_modalframe = {
    attach: function (context) {
      $('a.fpa_modalframe', context).click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        Drupal.modalFrame.open({
          url: $(this).attr('href'),
          draggable: false
        });
      });
    }
  };
})(jQuery);
