// $Id$
jQuery(function ($) {
  $('.fpa_modal').click(function () {
    Drupal.modalFrame.open({
      url: $(this).attr('href'),
      draggable: false,
      width: 950,
      height: 600,
      autoFit: false,
      onLoad: function (self, iFrameWindow, iFrameDocument) {
        $("td.permission:contains('" + Drupal.settings.fpa_field + "')", iFrameDocument).parents('tr').addClass('fpa_show');
      }
    });
    return false;
  });
});
