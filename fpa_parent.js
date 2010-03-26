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
        var odd_or_even = 'even';
        $("td.permission:contains('" + Drupal.settings.fpa_perm + "')", iFrameDocument).parents('tr').addClass('fpa_show');
        $(".fpa_show", iFrameDocument).each(function(index) {
          odd_or_even = odd_or_even == 'even' ? 'odd' : 'even';
          $(this).removeClass('odd even').addClass(odd_or_even);
        });
      }
    });
    return false;
  });
});
