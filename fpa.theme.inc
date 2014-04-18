<?php

/**
 * @file
 * Theme callbacks to pre-tag rows for FPA functionality.
 */

/**
 * Implements hook_theme().
 */
function fpa_theme($existing, $type, $theme, $path) {
  return array(
    'fpa_user_admin_permissions' => array(
      'render element' => 'form',
      'file' => 'fpa.theme.inc',
    ),
  );
}

/**
 * Theme function to pre-mark rows with FPA attributes.
 * 
 * Based on Drupal Core's permissions form theme function.
 * 
 * @see theme_user_admin_permissions().
 */
function theme_fpa_user_admin_permissions($variables) {
  $form = $variables['form'];
  
  $nameless_checkbox = array(
    '#type' => 'html_tag',
    '#tag' => 'input',
    '#attributes' => array(
      'type' => 'checkbox',
      'class' => array(
        'rid-1',
        'form-checkbox',
        'fpa-checkboxes-toggle',
      ),
    ),
  );
  
  $nameless_checkbox_output = drupal_render($nameless_checkbox);
  
  $permission_col_template = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array(
        'fpa-permission-container',
      ),
    ),
    'description' => array(
      '#markup' => '',
    ),
    'checkbox_cell' => array(
      '#type' => 'container',
      '#attributes' => array(
        'class' => array(
          'fpa-row-toggle-container',
        ),
      ),
      'checkbox_form_item' => array(
        '#type' => 'container',
        '#attributes' => array(
          'title' => t('Toggle visible checkboxes in this row.'),
          'class' => array(
            'form-item',
            'form-type-checkbox',
          ),
        ),
        'label' => array(
          '#type' => 'html_tag',
          '#tag' => 'label',
          '#attributes' => array(
            'class' => array(
              'element-invisible',
            ),
          ),
          '#value' => 'test',
        ),
        'checkbox' => array(
          '#markup' => $nameless_checkbox_output,
        ),
      ),
    ),
  );
  
  // Prepare role names processed by drupal_html_class() ahead of time.
  $roles_attr_values = array();
  
  foreach (element_children($form['checkboxes']) as $rid) {
    $roles_attr_values[$rid] = drupal_html_class($form['role_names'][$rid]['#markup']);
  }
  
  // Lists for wrapper.
  $modules = array();
  $user_roles = array();
  
  // Index of current module row.
  $module = NULL;
  
  // Row counter.
  $i = 0;
  
  $first_permission_index = array_shift(element_children($form['checkboxes']));
  
  // Iterate over rows in form table.
  foreach (element_children($form['permission']) as $key) {
    
    // Row template.
    $row = array(
      'data' => array(), // Array of table cells.
      'title' => array(), // HTML attribute on table row tag.
      FPA_ATTR_MODULE => array(), // HTML attribute on table row tag.
      FPA_ATTR_PERMISSION => array(), // HTML attribute on table row tag.
    );
    
    // Determine if row is module or permission.
    if (is_numeric($key)) {
      // Module row.
      
      
      // Mark current row with escaped module name.
      $row[FPA_ATTR_MODULE] = array(
        // System name
        0 => $form['permission'][$key]['#id'],
        // Readable name
        1 => strip_tags($form['permission'][$key]['#markup']),
      );
      
      // System Name
      $row['data'][] = array(
        'data' => $row[FPA_ATTR_MODULE][0],
        'class' => array('fpa-system-name module'),
      );
      
      // Readable
      $row['data'][] = array(
        'data' => drupal_render($form['permission'][$key]),
        'class' => array('module'),
        'id' => 'module-' . $form['permission'][$key]['#id'],
        'colspan' => count($form['role_names']['#value']) + 2,
      );
      
      $row['title'] = array($form['permission'][$key]['#id']);
      
      // $row['fpa-system-name'] = $row[FPA_ATTR_MODULE][0];
      
      $row[FPA_ATTR_MODULE] = array_unique(array_map('drupal_html_class', $row[FPA_ATTR_MODULE]));
      
      // Add modules to left-side modules list.
      $modules[$row[FPA_ATTR_MODULE][0]] = array(
        'text' => strip_tags($form['permission'][$key]['#markup']),
        'title' => array($form['permission'][$key]['#id']),
        FPA_ATTR_MODULE => $row[FPA_ATTR_MODULE],
        FPA_ATTR_PERMISSION => array(),
      );
      
      // Save row number for current module.
      $module = $i;
    }
    else {
      // Permission row.
      
      $permission_system_name = '';
      
      // Might be empty if no modules are displayed in Permissions Filter module.
      if (!empty($form['checkboxes'][$first_permission_index])) {
        $permission_system_name = $form['checkboxes'][$first_permission_index][$key]['#return_value'];
      }
      
      // System name
      $row['data'][] = array(
        'data' => $permission_system_name,
        'class' => array('fpa-system-name permission'),
      );
      
      
      $label = $permission_col_template;
      
      $label['description']['#markup'] = drupal_render($form['permission'][$key]);
      
      // Permissions filter might cause no Roles to display.
      if (count(element_children($form['checkboxes'])) == 0) {
        unset($label['checkbox_cell']);
      }
      
      // Readable
      $row['data'][] = array(
        'data' => drupal_render($label),
        'class' => array('permission'),
      );
      
      foreach (element_children($form['checkboxes']) as $rid) {
        $form['checkboxes'][$rid][$key]['#title'] = $form['role_names'][$rid]['#markup'] . ': ' . $form['permission'][$key]['#markup'];
        $form['checkboxes'][$rid][$key]['#title_display'] = 'invisible';
        
        // Filter permissions strips role id class from checkbox. Used by Drupal core functionality.
        $form['checkboxes'][$rid][$key]['#attributes']['class'][] = 'rid-' . $rid;
        
        $row['data'][] = array(
          'data' => drupal_render($form['checkboxes'][$rid][$key]),
          'class' => array(
            'checkbox',
          ),
          'title' => array(
            $form['role_names'][$rid]['#markup'],
          ),
          FPA_ATTR_ROLE => array(
            $roles_attr_values[$rid],
          ),
        );
      }
      
      if (!empty($rid)) {
        $row['title'] = array(
          $form['checkboxes'][$rid][$key]['#return_value'],
        );
      }
      
      // Mark current row with escaped permission name.
      $row[FPA_ATTR_PERMISSION] = array(
        // Permission system name.
        0 => $permission_system_name,
        // Readable description.
        1 => strip_tags($form['permission'][$key]['#markup']),
      );
      
      // Mark current row with current module.
      $row[FPA_ATTR_MODULE] = $rows[$module][FPA_ATTR_MODULE];
      
      $row[FPA_ATTR_PERMISSION] = array_unique(array_map('drupal_html_class', $row[FPA_ATTR_PERMISSION]));
      
      // Add current permission to current module row.
      $rows[$module][FPA_ATTR_PERMISSION] = array_merge($rows[$module][FPA_ATTR_PERMISSION], $row[FPA_ATTR_PERMISSION]);
      
      $modules[$rows[$module][FPA_ATTR_MODULE][0]][FPA_ATTR_PERMISSION][] = $row[FPA_ATTR_PERMISSION];
    }
    
    $rows[$i++] = $row;
  }
  
  $reset_button = array(
    '#type' => 'html_tag',
    '#tag' => 'input',
    '#attributes' => array(
      'type' => 'reset',
      'class' => 'form-submit',
      'value' => t('Reset Changes'),
    ),
  );
  
  // If there is no submit button, don't add the reset button.
  if (count(element_children($form['actions'])) > 0) {
    
    // Have the reset button appear before the submit button.
    array_unshift($form['actions'], $reset_button);
  }
  
  $actions_output = drupal_render_children($form['actions']);
  
  $header = array();
  
  $header[] = array(
    'data' => t('System Name'),
    'class' => array('fpa-system-name'),
  );
  
  $header[] = array(
    'data' => t('Permission') . $actions_output,
  );
  
  foreach (element_children($form['role_names']) as $rid) {
    
    $header[] = array(
      'data' => drupal_render($form['role_names'][$rid]) . $nameless_checkbox_output,
      'class' => array(
        'checkbox',
      ),
      'title' => array(
        $form['role_names'][$rid]['#markup'],
      ),
      FPA_ATTR_ROLE => array(
        $roles_attr_values[$rid],
      ),
    );
    $user_roles[$rid] = $form['role_names'][$rid]['#markup'];
  }
  
  $table = array(
    'header' => $header,
    'rows' => $rows,
  );
  
  $output = _fpa_wrapper($table, $modules, $user_roles, $actions_output);
  
  $output .= drupal_render_children($form);
  
  return $output;
}

/**
 * Wraps table output in the FPA filter.
 */
function _fpa_wrapper($permissions_table, $modules, $user_roles, $actions_output) {
  
  $same_page = trim(parse_url($_SERVER['HTTP_REFERER'], PHP_URL_PATH), '/') == $_GET['q'];
  
  $class_hide_descriptions = 'fpa-hide-descriptions';
  $class_hide_system_names = 'fpa-hide-system-names';
  
  $render = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array(
        'fpa-container',
        !empty($_COOKIE[$class_hide_descriptions]) && $_COOKIE[$class_hide_descriptions] == 'true' ? $class_hide_descriptions : '',
        !empty($_COOKIE[$class_hide_system_names]) && $_COOKIE[$class_hide_system_names] == 'true' ? $class_hide_system_names : '',
      ),
    ),
  );
  
  $hide_container = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array(
        'fpa-toggle-container',
      ),
    ),
  );
  
  
  $toggle_link_template = array(
    '#type' => 'markup', // html_tag adds erroneous newlines, which mess with inline elements.
    '#markup' => '',
    '#prefix' => '<span class="fpa-toggle-link">',
    '#suffix' => '</span>'
  );
  
  $toggle_links_template = array(
    'hide' => $toggle_link_template,
    'show' => $toggle_link_template,
  );
  
  
  $toggle_descriptions_links = $toggle_links_template;
  
  $toggle_descriptions_links['hide']['#markup'] = t('Hide descriptions');
  $toggle_descriptions_links['show']['#markup'] = t('Show descriptions');
  
  $hide_descriptions = array(
    '#theme' => 'link',
    '#text' => drupal_render($toggle_descriptions_links),
    '#path' => $_GET['q'],
    '#options' => array(
      'attributes' => array(
        'fpa-toggle-class' => $class_hide_descriptions,
      ),
      'html' => TRUE,
      'fragment' => ' ',
    ),
  );
  
  $hide_container['hide_descriptions'] = $hide_descriptions;
  
  
  $toggle_system_name_links = $toggle_links_template;
  
  $toggle_system_name_links['hide']['#markup'] = t('Hide system names');
  $toggle_system_name_links['show']['#markup'] = t('Show system names');
  
  $hide_system_name = array(
    '#theme' => 'link',
    '#text' => drupal_render($toggle_system_name_links),
    '#path' => $_GET['q'],
    '#options' => array(
      'attributes' => array(
        'fpa-toggle-class' => $class_hide_system_names,
      ),
      'html' => TRUE,
      'fragment' => ' ',
    ),
  );
  
  $hide_container['hide_system_name'] = $hide_system_name;
  
  $render['hide_container'] = $hide_container;
  
  $wrapper = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array(
        'fpa-wrapper',
      ),
    ),
  );
  
  $render['wrapper'] = &$wrapper;
  
  /**
   * <style /> block template.
   */
  $style_template = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array(
        'style-wrapper-class-name', // Override on specific block.
      ),
    ),
  );
  
  $style_template['style'] = array(
    '#type' => 'html_tag',
    '#tag' => 'style',
    '#attributes' => array(
      'type' => array(
        'text/css',
      ),
    ),
    '#value' => '', // #value needed for closing tag.
  );
  
  /**
   * <style /> block for role filtering.
   */
  $wrapper['role_styles'] = $style_template;
  $wrapper['role_styles']['#attributes']['class'][0] = 'fpa-role-styles';
  
  /**
   * <style /> block for permission filtering.
   */
  $wrapper['perm_styles'] = $style_template;
  $wrapper['perm_styles']['#attributes']['class'][0] = 'fpa-perm-styles';
  
  /**
   * @todo need to generate initial styles on server side for initial page load performance.
   */
  
  /**
   * Left section contains module list and form submission button.
   */
  $left_section = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array(
        'fpa-left-section',
      ),
    ),
  );
  
  $wrapper['left_section'] = &$left_section;
  
  
  /**
   * Right section contains filter form and permissions table.
   */
  $right_section = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array(
        'fpa-right-section',
      ),
    ),
  );
  
  $wrapper['right_section'] = &$right_section;
  
  $module_template = array(
    FPA_ATTR_MODULE => array(),
    FPA_ATTR_PERMISSION => array(),
    'data' => array(
      '#type' => 'container',
      '#attributes' => array(),
      
      'link' => array(
        '#type' => 'markup',
        '#markup' => '', // l($module['text'], 'admin/people/permissions', $options)
      ),
      
      'counters' => array(),
      
      'total' => array(
        '#type' => 'html_tag',
        '#tag' => 'span',
        '#attributes' => array(
          'class' => array('fpa-perm-total'),
          'fpa-total' => 0,
        ),
        '#value' => '', // #value needed for closing tag.
      ),
    ),
  );
  
  $counter_template = array(
    '#type' => 'html_tag',
    '#tag' => 'span',
    '#attributes' => array(
      'class' => array('fpa-perm-counter'),
      FPA_ATTR_PERMISSION => array(), // Counters only count permissions match.
    ),
    '#value' => '', // #value required for closing tag.
  );
  
  $items = array();
  
  $all_modules = array(
    'text' => t('All modules'),
    FPA_ATTR_MODULE => array(),
    FPA_ATTR_PERMISSION => array(),
  );
  
  array_unshift($modules, $all_modules);
  
  $all_modules_counters = array();
  
  foreach ($modules as $module) {
    
    $module_item = $module_template;
    
    $module_item[FPA_ATTR_MODULE] = $module[FPA_ATTR_MODULE];
    $module_item[FPA_ATTR_PERMISSION] = array_reduce($module[FPA_ATTR_PERMISSION], 'array_merge', array());
    
    // Use link for accessibility and tabability.
    $options = array(
      'fragment' => 'all',
    );
    
    if (!empty($module['title'])) {
      $options['fragment'] = 'module-' . $module['title'][0];
      $options['attributes']['title'] = $module['title'][0];
    }
    
    $module_item['data']['link']['#markup'] = l($module['text'], 'admin/people/permissions', $options);
    
    foreach ($module[FPA_ATTR_PERMISSION] as $module_perm) {
      
      $counter_item = $counter_template;
      
      $counter_item['#attributes'][FPA_ATTR_PERMISSION] = $module_perm;
      
      $all_modules_counters[] = $counter_item;
      
      $module_item['data']['counters'][] = $counter_item;
    }
    
    $module_item['data']['total']['#attributes']['fpa-total'] = count($module[FPA_ATTR_PERMISSION]);
    
    $items[] = $module_item;
  }
  
  $items[0]['data']['counters'] = $all_modules_counters;
  $items[0]['data']['total']['#attributes']['fpa-total'] = count($all_modules_counters);
  
  foreach ($items as &$item) {
    $item['data'] = drupal_render($item['data']);
  }
  
  $left_section['list'] = array(
    '#items' => $items,
    '#theme' => 'item_list',
  );
  
  $left_section['buttons'] = array(
    '#type' => 'markup',
    '#markup' => $actions_output,
  );
  
  $filter_form = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array(
        'fpa-filter-form',
      ),
    ),
  );
  
  $clear_button = array(
    '#type' => 'html_tag',
    '#tag' => 'input',
    '#attributes' => array(
      'type' => array(
        'button',
      ),
      'class' => array(
        'fpa-clear-search',
        'form-submit',
      ),
      'value' => 'Clear Filter',
    ),
  );
  
  $default_filter = '';
  
  if (!empty($_COOKIE['fpa_filter']) && $same_page) {
    $default_filter = $_COOKIE['fpa_filter'];
  }
  
  if (!empty($_GET['fpa_perm'])) {
    $default_filter = $_GET['fpa_perm'];
  }
  
  
  $filter_form['perm_filter'] = array(
    '#type' => 'textfield',
    '#title' => t('Filter:'),
    '#description' => t('Enter in the format of "permission@module", <br>e.g. admin@system will show only permissions with<br>the text "admin" in modules with the text "system".'),
    '#size' => 25,
    '#field_suffix' => drupal_render($clear_button),
    '#attributes' => array(
      'placeholder' => array(
        'permission@module',
      ),
      'autofocus' => 'autofocus',
    ),
    '#value' => $default_filter,
  );
  
  $cookie_roles = (!empty($_COOKIE['fpa_roles']) && $same_page) ? json_decode($_COOKIE['fpa_roles']) : array();
  
  $options = array(
    '*' => t('--All Roles'),
  );
  
  if (!empty($user_roles)) {
    $options = array_merge($options, array_combine(array_map('drupal_html_class', $user_roles), $user_roles));
  }
  
  if (in_array('*', $cookie_roles)) {
    $cookie_roles  = array('*');
  }
  
  $filter_form['roles'] = array(
    '#type' => 'select',
    '#title' => t('Roles:'),
    '#description' => t('Select which roles to display.<br>Ctrl+click to select multiple.'),
    '#size' => 5,
    '#options' => $options,
    '#attributes' => array(
      'multiple' => 'multiple',
      'autocomplete' => 'off',
    ),
    '#value' => count(array_intersect($cookie_roles, array_keys($options))) > 0 ? $cookie_roles : array('*'),
  );
  
  $right_section['filter_form'] = $filter_form;
  
  $table_wrapper = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array(
        'fpa-table-wrapper',
      ),
    ),
  );
  
  $table_wrapper['table'] = array(
    '#theme' => 'table',
    '#header' => $permissions_table['header'],
    '#rows' => $permissions_table['rows'],
    '#attributes' => array(
      'id' => 'permissions',
    ),
  );
  
  $table_wrapper['buttons'] = array(
    '#type' => 'markup',
    '#markup' => $actions_output,
  );
  
  $right_section['table_wrapper'] = $table_wrapper;
  
  
  return drupal_render($render);
}
