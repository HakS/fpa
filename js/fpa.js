
/**
 * @file
 * JS functionality that creates dynamic CSS which hides permission rows.
 */

// Wrapper normalizes 'jQuery' to '$'.
;(function ($, Drupal) {
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
    },
    filter_timeout: null,
    filter_timeout_time: 0
  };
  
  /**
   * Prepares a string for use as a CSS identifier (element, class, or ID name).
   * 
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
   * Prepares a string for use as a valid class name.
   * 
   * @see https://api.drupal.org/api/drupal/includes!common.inc/function/drupal_html_class/7
   */
  var drupal_html_class = (function drupal_html_class_static() {
    // static vars
    var classes = {};
    
    return function drupal_html_class(str) {
      
      if (typeof classes[str] === 'undefined') {
        classes[str] = drupal_clean_css_identifier(str.toLowerCase());
      }
      
      return classes[str];
    };
  })();
  
  /**
   * Callback for click events on module list.
   */
  fpa.filter_module = function (e) {
    e.preventDefault();
    e.stopPropagation();
    
    var $this = $(this);
    
    
    var current_perm = fpa.dom.filter.val().replace(/(@.*)/, ''); // remove current module filter string.
    
    current_perm += $this.attr(fpa.attr.module) !== '' ? '@' + $this.find('a[href]').text() : '';
    
    fpa.dom.filter.val(current_perm); // remove trailing @ as that means no module; clean 'All' filter value
    
    /**
     * ~= matches exactly one whitespace separated word in attribute.
     * 
     * @see http://www.w3.org/TR/CSS2/selector.html#matching-attrs
     */
    fpa.filter('~=');
  };
  
  fpa.build_filter_selectors = (function build_filter_selectors_static() {
    
    var selectors = {
      '*=': {},
      '~=': {}
    };
    
    return function build_filter_selectors(filter_string, module_match) {
      
      module_match = selectors.hasOwnProperty(module_match) ? module_match : '*=';
      
      filter_string = fpa.dom.filter.val();
      
      if (typeof selectors[module_match][filter_string] === 'undefined') {
        
        var filter_selector = [
          '', // 0 => permission
          ''  // 1 => module
        ];
        
        if (['', '@'].indexOf(filter_string) === -1) {
          
          var matches = filter_string.match(/([^@]*)@?(.*)/i);
          matches.shift(); // Remove whole match item.
          
          var matches_safe = $.map(matches, drupal_html_class);
          
          // Permission filter present
          if (matches_safe[0].length > 0) {
            filter_selector[0] = '[' + fpa.attr.permission + '*="' + matches_safe[0] + '"]';
          }
          
          // Module filter present
          if (matches_safe[1].length > 0) {
            filter_selector[1] = '[' + fpa.attr.module + module_match + '"' + matches_safe[1] + '"]';
          }
        }
        
        selectors[module_match][filter_string] = filter_selector;
      }
      
      return selectors[module_match][filter_string];
    };
  })();
  
  fpa.filter = function (module_match) {
    
    // Assign default value if undefined.
    module_match = typeof module_match === 'string' ? module_match : '*=';
    
    var table_base_selector = '.fpa-table-wrapper tr[' + fpa.attr.module + ']';
    var list_counter_selector = '.fpa-left-section .item-list li span[' + fpa.attr.permission + ']';
    var list_base_selector = '.fpa-left-section .item-list li[' + fpa.attr.module + ']';
    
    var module_active_style = '{margin-right:-1px; background-color: white; border-right: solid 1px transparent;}';
    
    var perm = fpa.dom.filter.val();
    
    $.cookie('fpa_filter', perm, {path: '/'});
          
    /**
     * Prevent the current filter from being cleared on form reset.
     * 
     * element.defaultValue is what 'input' elements reset to.
     * 
     * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-html.html#ID-26091157
     */
    fpa.dom.filter.get(0).defaultValue = perm;
    
    // By default highlight 'All modules' item.
    var perm_style_code = '';
    
    var filter_selector = fpa.build_filter_selectors(perm, module_match);
    
    // Ensure that 'perm' is filter-able value.
    if (['', '@'].indexOf(perm) === -1) {
      
      // Show matching permissions table rows.
      perm_style_code += table_base_selector + filter_selector.join('') + '{display: table-row;}';
      // Change visibility of counter span's. Only match on permission.
      perm_style_code += list_counter_selector + filter_selector[0] + '{display: inline;}';
      // Highlight matching items in the module list.
      if (filter_selector[1].length > 0) {
        perm_style_code += list_base_selector + filter_selector[1] + module_active_style;
      }

      // Deactivate items that do not match. Specificity of matching overrides.
      perm_style_code += table_base_selector + '{display: none;}';
      if (filter_selector[0].length > 0) {
        perm_style_code += list_counter_selector + '{display: none;}';
      }
      if (filter_selector[1].length === 0) {
        perm_style_code += list_base_selector + '[' + fpa.attr.module + '=""]' + module_active_style;
      }
    }
    else {
      perm_style_code += list_base_selector + '[' + fpa.attr.module + '=""]' + module_active_style;
    }
    
    // .html() does not work on <style /> elements.
    fpa.dom.perm_style.innerHTML = perm_style_code;
  };
  
  fpa.build_role_selectors = function (roles) {
    
    roles = roles || [];
    
    var selectors = [];
    
    for (var i in roles) {
      if (roles.hasOwnProperty(i)) {
        selectors.push([
          '.fpa-table-wrapper .checkbox[' + fpa.attr.role + '="' + drupal_html_class(roles[i]) + '"]',
          '.fpa-table-wrapper td.module[' + fpa.attr.role + '][' + fpa.attr.role + '="' + drupal_html_class(roles[i]) + '"]',
        ].join(','));
      }
    }
    
    return selectors;
  };
  
  // Even handler for role selection.
  fpa.filter_roles = function () {
    
    /**
     * Prevent the current filter from being cleared on form reset.
     * 
     * element.defaultSelected is what 'option' elements reset to.
     * 
     * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-html.html#ID-37770574
     */
    fpa.dom.role_select.find('option').each(function () {
      this.defaultSelected = this.selected;
    });
    
    var values = fpa.dom.role_select.val() || [];
    var selector_array = [];
    var role_style_code = '';
    
    $.cookie('fpa_roles', JSON.stringify(values), {path: '/'});
    
    if (values.length > 0) {
      
      selector_array = fpa.build_role_selectors(values);
      
      role_style_code += selector_array.join(',') + ' {display: table-cell;}';
      
      // Ensure right border on last visible role.
      role_style_code += selector_array.pop() + ' {border-right: 1px solid #bebfb9;}';
    }
    else {
      role_style_code += 'td[class="permission"] {border-right: 1px solid #bebfb9;}';
    }
    
    role_style_code += '.fpa-table-wrapper .checkbox, .fpa-table-wrapper td.module[' + fpa.attr.role + '] {display: none;}';
    
    fpa.dom.role_style.innerHTML = role_style_code;
  };
  
  fpa.select = function (context) {
    
    fpa.dom = {};
    
    fpa.dom.context = $(context);
    
    fpa.dom.form = fpa.dom.context.find(fpa.selector.form);
    
    // Prevent anything else from running if the form is not found.
    if (fpa.dom.form.length === 0) {
      return false;
    }
    
    fpa.dom.container = fpa.dom.form.find('.fpa-container');
    
    // Raw element since $().html(); does not work for <style /> elements.
    fpa.dom.perm_style = fpa.dom.container.find('.fpa-perm-styles style').get(0);
    fpa.dom.role_style = fpa.dom.container.find('.fpa-role-styles style').get(0);
    
    fpa.dom.section_left = fpa.dom.container.find('.fpa-left-section');
    
    fpa.dom.table_wrapper = fpa.dom.container.find('.fpa-table-wrapper');
    fpa.dom.table = fpa.dom.table_wrapper.find(fpa.selector.table);
    
    fpa.dom.module_list = fpa.dom.section_left.find('ul');
    
    fpa.dom.filter_form = fpa.dom.container.find('.fpa-filter-form');
    fpa.dom.filter = fpa.dom.filter_form.find('input[type="text"]');
    fpa.dom.role_select = fpa.dom.filter_form.find('select');
    
    return true;
  };
  
  fpa.prepare = function () {
    
    fpa.filter_timeout_time = Math.min(fpa.dom.table.find('tr').length, 500);
    
    fpa.dom.form
      .delegate('.fpa-toggle-container a', 'click', function _fpa_toggle(e) {
        e.preventDefault();
        
        var $this = $(this);
        
        var toggle_class = $this.attr('fpa-toggle-class');
        
        var has_class = fpa.dom.container.toggleClass(toggle_class).hasClass(toggle_class);
        
        $.cookie(toggle_class, has_class, {path: '/'});
      })
    ;
    
    fpa.dom.section_left
      .delegate('li[' + fpa.attr.module + ']', 'click', fpa.filter_module)
    ;
    
    fpa.dom.filter
      // Prevent Enter/Return from submitting form.
      .keypress(function _prevent_form_submission(e) {
        if (e.which === 13) {
          e.preventDefault();
          e.stopPropagation();
        }
      })
      // Prevent non-character keys from triggering filter.
      .keyup(function _fpa_filter_keyup(e) {
        
        // Prevent ['Enter', 'Shift', 'Ctrl', 'Alt'] from triggering filter.
        if ([13, 16, 17, 18].indexOf(e.which) === -1) {
          
          // clearTimeout(fpa.filter_timeout);
//           
          // fpa.filter_timeout = setTimeout(function () {
            fpa.filter();
          // }, fpa.filter_timeout_time);
        }
      })
    ;
    
    // Set default value of filter field if the server is providing one.
    fpa.dom.filter
      .keyup()
    ;
    
    // Handle links to sections on permission admin page.
    fpa.dom.form
      .delegate('a[href*="admin/people/permissions#"]', 'click', function _fpa_inter_page_links_click(e) {
        e.stopPropagation();
        
        fpa.dom.module_list
          .find('li[' + fpa.attr.module + '~="' + drupal_html_class(this.hash.substring(8)) + '"]')
          .click()
        ;
      })
    ;
    
    if(window.location.hash.indexOf('module-') === 1) {
      
      fpa.dom.module_list
        .find('li[' + fpa.attr.module + '~="' + drupal_html_class(window.location.hash.substring(8)) + '"]')
        .click()
      ;
    }
    
    fpa.dom.form.bind('reset', function _fpa_form_reset() {
      
      // Wait till after the form elements have been reset.
      setTimeout(function _fpa_fix_authenticated_behavior() {
        
        // Trigger Drupal core 'authenticated user' checkbox behavior.
        fpa.dom.form
          .find('input[type="checkbox"].rid-2')
          .each(Drupal.behaviors.permissions.toggle)
        ;
      }, 0);
    });
    
    
    // Role checkboxes toggle all visible permissions for this column.
    fpa.dom.table_wrapper
      .delegate('th[' + fpa.attr.role + '] input[type="checkbox"]', 'change', function _fpa_role_permissions_toggle() {
        
        // Get visible rows selectors.
        var filters = fpa.build_filter_selectors(fpa.dom.filter.val());
        
        fpa.dom.table_wrapper
          .find('tr' + filters.join('') + ' .checkbox[' + fpa.attr.role + '="' + $(this).parent().attr(fpa.attr.role) + '"] input[type="checkbox"]')
          .not('.dummy-checkbox')
          .attr('checked', $(this).attr('checked'))
          .filter('.rid-2') // Following only applies to "Authenticated User" role.
          .each(Drupal.behaviors.permissions.toggle)
        ;
        
      })
    ;
    
    // Role checkboxes toggle all visible permissions for this column.
    fpa.dom.table_wrapper
      .delegate('input[type="checkbox"].fpa-row-toggle', 'change', function _fpa_role_permissions_toggle() {
        
        // Get visible rows selectors.
        var filters = fpa.build_role_selectors(fpa.dom.role_select.val());
        
        $(this)
          .closest('tr')
          .find('td.checkbox')
          .filter(filters.join(','))
          .find('input[type="checkbox"]')
          .not('.dummy-checkbox')
          .attr('checked', $(this).attr('checked'))
          .filter('.rid-2') // Following only applies to "Authenticated User" role.
          .each(Drupal.behaviors.permissions.toggle)
        ;
        
      })
    ;
    
    /*
    fpa.dom.table
      .delegate('td.fpa-system-name+td.permission', 'mouseenter', function _fpa_row_checkbox() {
        return;
        $('<input type="checkbox" style="veritical-align:middle; display:inline-block;" />')
          .click(function (e) {
            e.stopPropagation(); // Prevent admin_menu changing row visibility.
          })
          .change(function () {
            
            var $this = $(this);
            
            var role_name = $this.parent().attr('title');
            var module_system_name = $this.closest('tr').attr('title');
            var selector = 'tr[' + fpa.attr.module + '~="' + drupal_html_class(module_system_name) + '"] td[title="' + role_name + '"].checkbox input[type="checkbox"]';
            
            $(selector)
              .attr('checked', $this.attr('checked'))
              .filter('.rid-2') // Following only apply to "Authenticated User" role.
              .each(Drupal.behaviors.permissions.toggle)
            ;
            
          })
          // .appendTo(this)
          // .wrap('<div class="form-item form-type-checkbox " />')
        ;
      })
      .delegate('td.fpa-system-name+td.permission', 'mouseleave', function () {
        // $(this).find('input[type="checkbox"]').remove();
      })
    ;
    */
    
    // Clear contents of search field and reset visible permissions.
    (function () {
      
      var foci;
      
      fpa.dom.form
        .delegate('.fpa-clear-search', 'mousedown', function () {
          foci = document.activeElement;
        })
        .delegate('.fpa-clear-search', 'click', function () {
          
          fpa.dom.filter
            .val('')
            .keyup()
          ;
          
          foci.focus();
        })
      ;
    })();
    
    
    
    // Change visible roles.
    fpa.dom.role_select
      .bind('change blur mouseout', fpa.filter_roles)
      .change()
      // Prevent <option /> elements from bubbling mouseout event.
      .find('option')
      .mouseout(function (e) {
        e.stopPropagation();
      })
    ;
    
    // Focus on element takes long time, bump after normal execution.
    setTimeout(function _fpa_filter_focus() {
      fpa.dom.filter.focus();
    }, 0);
    
  };
  
  Drupal.behaviors.fpa = {
    attach: function (context, settings) {
      
      // Add touch-screen styling for checkboxes to make easier to use.
      if ('ontouchstart' in document.documentElement) {
        $(document.body).addClass('fpa-mobile');
      }
      
      // Fix table sticky table headers width due to changes in visible roles.
      $(window)
        .bind('scroll', function _fpa_fix_tableheader() {
          $(this).triggerHandler('resize.drupal-tableheader');
        })
      ;
    
      fpa.attr = settings.fpa.attr;
      
      if (fpa.select(context)) {
        fpa.prepare();
      }
    }
  };
})(jQuery, Drupal);
