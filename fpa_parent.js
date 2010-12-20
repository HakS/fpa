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
        $("#permissions", iFrameDocument).find("td.permission").filter(function () {
          return this.innerHTML.indexOf(Drupal.settings.fpa_perm) != -1;
        }).parent().each(function(index) {
          odd_or_even = odd_or_even == 'even' ? 'odd' : 'even';
          $(this).removeClass('odd even').addClass(odd_or_even);
        }).addClass('fpa_show');
      }
    });
    return false;
  });
});
