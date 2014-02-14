
/**
 * @file
 * JS functionality that creates dynamic CSS which hides permission rows.
 */

// Wrapper normalizes 'jQuery' to '$'.
;(function ($) {
  "use strict";
  
  var fpa = {
    selector : {
      form: '#user-admin-permissions',
      table : '#permissions'
    },
    dom : {},
    attr: {
      permission: '',
      module: ''
    }
  };
  
  /**
   * @see https://api.drupal.org/api/drupal/includes!common.inc/function/drupal_clean_css_identifier/7
   */
  var drupal_clean_css_identifier = function (str) {
    
    return str
    // replace ' ', '_', '/', '[' with '-'
    .replace(/[ _\/\[]/g, '-')
    // replace ']' with ''
    .replace(/\]/g, '')
    // Valid characters in a CSS identifier are:
    // - the hyphen (U+002D)
    // - a-z (U+0030 - U+0039)
    // - A-Z (U+0041 - U+005A)
    // - the underscore (U+005F)
    // - 0-9 (U+0061 - U+007A)
    // - ISO 10646 characters U+00A1 and higher
    // We strip out any character not in the above list.
    .replace(/[^\u002D\u0030-\u0039\u0041-\u005A\u005F\u0061-\u007A\u00A1-\uFFFF]/, '');
  };
  
  /**
   * Changes a string into a safe single css class.
   * 
   * @see https://api.drupal.org/api/drupal/includes!common.inc/function/drupal_html_class/7
   */
  var drupal_html_class = function (str) {
    
    return drupal_clean_css_identifier(str.toLowerCase());
  };
  
  /**
   * Callback for click events on module list.
   */
  fpa.filter_module = function (e) {
    e.preventDefault();
    e.stopPropagation();
    
    
    var $this = $(this);
    
    var current_perm = fpa.dom.filter.val().replace(/(@.*)/, ''); // remove current module filter string.
    
    current_perm += $this.attr(fpa.attr.module) != '' ? '@' + $this.find('a[href]').text() : '';
    
    fpa.dom.filter.val(current_perm); // remove trailing @ as that means no module; clean 'All' filter value
    
    // ~= matches exactly one whitespace separated word in attribute.
    fpa.filter('~=');
  };
  
  var table_base_selector = '.fpa-table-wrapper tr';
  var list_counter_selector = '.fpa-left-section .item-list li span';
  var list_base_selector = '.fpa-left-section .item-list li';
  
  var module_active_style = '{margin-right:-1px; background-color: white; border-right: solid 1px transparent;}';
  
  fpa.filter = function (module_match) {
    
    module_match = typeof module_match !== 'undefined' ? module_match : '*=';
    var perm = fpa.dom.filter.val();
    
    // By default highlight 'All modules' item.
    var perm_style_code = list_base_selector + '[' + fpa.attr.module + '=""]' + module_active_style;
    
    // Ensure that 'perm' is filter-able value.
    if (['', '@'].indexOf(perm) == -1) {
      var matches = perm.match(/([^@]*)@?(.*)/i);
      matches.shift(); // Remove whole match item.
      var perm_copy = $.map(matches, drupal_html_class);
      var filter_selector = [
        '', // 0 => permission
        ''  // 1 => module
      ];
      
      // Set defaults of no matches
      perm_style_code += table_base_selector + '[' + fpa.attr.module + ']{display: none;}';
      if (perm_copy[0].length > 0) {
        perm_style_code += list_counter_selector + '[' + fpa.attr.permission + ']{display: none;}';
      }
      if (perm_copy[1].length > 0) {
        perm_style_code += list_base_selector + '[' + fpa.attr.module + ']{background-color: inherit;}';
      }
      
      // Permission filter present
      if (perm_copy[0].length > 0) {
        filter_selector[0] = '[' + fpa.attr.permission + '*="' + perm_copy[0] + '"]';
      }
      
      // Module filter present
      if (perm_copy[1].length > 0) {
        filter_selector[1] = '[' + fpa.attr.module + module_match + '"' + perm_copy[1] + '"]';
      }
      
      // Show matching permissions table rows.
      perm_style_code += table_base_selector + filter_selector.join('') + '{display: table-row;}';
      // Change visibility of counter span's.
      perm_style_code += list_counter_selector + filter_selector[0] + '{display: inline;}';
      // Highlight matching items in the module list.
      if (filter_selector[1].length > 0) {
        perm_style_code += list_base_selector + filter_selector[1] + module_active_style;
      }
    }
    
    // .html() does not work on <style /> elements.
    fpa.dom.perm_style.innerHTML = perm_style_code;
  };
  
  // Even handler for role selection.
  fpa.filter_roles = function (e) {
    
    var values = $(this).val();
    var selector_array = [];
    var role_style_code = '.fpa-table-wrapper .checkbox{display: none !important;}';
    
    for (var i in values) {
      selector_array.push('.fpa-table-wrapper .checkbox[title="' + values[i] + '"]');
    }
    role_style_code += selector_array.join(',') + '{display: table-cell !important;}';
    
    // Ensure right border on last visible role.
    role_style_code += selector_array.pop() + '{border-right: 1px solid #bebfb9;}';
    
    fpa.dom.role_style.innerHTML = role_style_code;
  };
  
  fpa.select = function (context) {
    
    fpa.dom = {};
    
    fpa.dom.context = $(context);
    
    fpa.dom.form = fpa.dom.context.find(fpa.selector.form);
    
    // Prevent anything else from running if the form is not found.
    if (fpa.dom.form.length == 0) {
      return false;
    }
    
    fpa.dom.wrapper = fpa.dom.form.find('.fpa-wrapper');
    
    // Raw element since $().html(); does not work for <style /> elements.
    fpa.dom.perm_style = fpa.dom.wrapper.find('.fpa-perm-styles style').get(0);
    fpa.dom.role_style = fpa.dom.wrapper.find('.fpa-role-styles style').get(0);
    
    fpa.dom.section_left = fpa.dom.wrapper.find('.fpa-left-section');
    fpa.dom.section_right = fpa.dom.wrapper.find('.fpa-right-section');
    
    fpa.dom.table = fpa.dom.section_right.find(fpa.selector.table);
    
    fpa.dom.module_list = fpa.dom.section_left.find('ul');
    fpa.dom.all_modules = fpa.dom.module_list.find('.first');
    
    
    fpa.dom.filter_form = fpa.dom.section_right.find('.fpa-filter-form');
    fpa.dom.filter = fpa.dom.filter_form.find('input[type="text"]');
    fpa.dom.clear_search = fpa.dom.filter_form.find('.fpa-clear-search');
    fpa.dom.role_select = fpa.dom.filter_form.find('select');
    
    return true;
  };
  
  var timeout = null;
  
  fpa.prepare = function (context) {
    
    fpa.dom.section_left.delegate('li[' + fpa.attr.module + ']', 'click', fpa.filter_module);
    
    fpa.dom.filter
    .val(Drupal.settings.fpa.filter_value)
    .keyup(function _fpa_filter(e) {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fpa.filter();
      }, 0);
    });
    
    fpa.dom.form
    // Prevent Enter/Return from submitting form.
    .delegate(':input', 'keypress', function _prevent_form_submission(e) {
      if (e.which == 13) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    
    // Handle links to sections on permission admin page.
    fpa.dom.form
    .delegate('a[href*="admin/people/permissions#"]', 'click', function (e) {
      e.stopPropagation();
      
      fpa.dom.module_list.find('li[' + fpa.attr.module + '~="' + drupal_html_class(this.hash.substring(8)) + '"]').click();
    });
    
    // If there is a module anchor in the url, filter for that module.
    if (Drupal.settings.fpa.filter_value == '' && window.location.hash.indexOf('module-') > -1) {
      
      fpa.dom.module_list.find('li[' + fpa.attr.module + '~="' + drupal_html_class(window.location.hash.substring(8)) + '"]').click();
    }
    else {
      fpa.filter();
    }
    
    // Move submission button to below module list and bottom of table.
    fpa.dom.form.find('input[type="submit"][name="op"]').remove()
    .clone().insertAfter(fpa.dom.module_list)
    .clone().insertAfter(fpa.dom.table);
      
    // Clear contents of search field and reset visible permissions.
    fpa.dom.clear_search
    .click(function (e) {
      e.preventDefault();
      fpa.dom.filter.val('').triggerHandler('keyup');
    });
    
    
    // Change visible roles.
    fpa.dom.role_select
    .change(fpa.filter_roles);
    
    // Fix table sticky table headers width due to changes in visible roles.
    $(window).bind('scroll', function _fpa_fix_tableheader(e) {
      $(this).triggerHandler('resize.drupal-tableheader');
    });
    
    // Focus on element takes long time, bump after normal execution.
    setTimeout(function _fpa_filter_focus() {
      fpa.dom.filter.focus();
    }, 0);
    
  };
  
  Drupal.behaviors.fpa = {
    attach: function (context) {
      
      fpa.attr.permission = Drupal.settings.fpa.attr.permission;
      fpa.attr.module = Drupal.settings.fpa.attr.module;
      
      if (fpa.select(context)) {
        fpa.prepare(context);
      }
    }
  };
})(jQuery);
