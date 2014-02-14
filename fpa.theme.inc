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

  $roles = user_roles();
  
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
    
    /**
     * @TODO add system name column as real column, remove pseudo elements
     */
    
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
        'colspan' => count($form['role_names']['#value']) + 1,
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
      
      // System name
      $row['data'][] = array(
        'data' => $form['checkboxes'][$first_permission_index][$key]['#return_value'],
        'class' => array('fpa-system-name permission'),
      );
      
      // Readable
      $row['data'][] = array(
        'data' => drupal_render($form['permission'][$key]),
        'class' => array('permission'),
      );
      
      foreach (element_children($form['checkboxes']) as $rid) {
        $form['checkboxes'][$rid][$key]['#title'] = $roles[$rid] . ': ' . $form['permission'][$key]['#markup'];
        $form['checkboxes'][$rid][$key]['#title_display'] = 'invisible';
        $row['data'][] = array(
          'data' => drupal_render($form['checkboxes'][$rid][$key]),
          'class' => array('checkbox'),
          'title' => array($form['role_names'][$rid]['#markup']),
        );
      }
      
      $row['title'] = array(
        $form['checkboxes'][$rid][$key]['#return_value'],
      );
      
      // Mark current row with escaped permission name.
      $row[FPA_ATTR_PERMISSION] = array(
        // Permission system name.
        0 => $form['checkboxes'][$first_permission_index][$key]['#return_value'],
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
  
  $header[] = array(
    'data' => t('System Name'),
    'class' => array('fpa-system-name'),
  );
  
  $header[] = t('Permission');
  foreach (element_children($form['role_names']) as $rid) {
    $header[] = array(
      'data' => drupal_render($form['role_names'][$rid]),
      'class' => array('checkbox'),
      'title' => $form['role_names'][$rid]['#markup'],
    );
    $user_roles[$rid] = $form['role_names'][$rid]['#markup'];
  }
  
  $output = theme('system_compact_link');
  $output .= _fpa_wrapper(theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('id' => 'permissions'))), $modules, $user_roles);
  $output .= drupal_render_children($form);
  return $output;
}

/**
 * Wraps table output in the FPA filter.
 */
function _fpa_wrapper($permissions_table, $modules, $user_roles) {
  $render = array();
  
  $wrapper = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array(
        'fpa-wrapper',
        'fpa-show-system-name'
      ),
    ),
  );
  
  $render['wrapper'] = &$wrapper;
  
  /**
   * <style /> block for role filtering.
   */
  $role_styles = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array(
        'fpa-role-styles',
      ),
    ),
  );
  
  $role_styles['style'] = array(
    '#type' => 'html_tag',
    '#tag' => 'style',
    '#attributes' => array(
      'type' => 'text/css',
    ),
    '#value' => '', // Empty #value needed to complete 'style' tag.
  );
  
  $wrapper['role_styles'] = $role_styles;
  
  
  /**
   * <style /> block for permission filtering.
   */
  $perm_styles = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array(
        'fpa-perm-styles',
      ),
    ),
  );
  
  $perm_styles['style'] = array(
    '#type' => 'html_tag',
    '#tag' => 'style',
    '#attributes' => array(
      'type' => 'text/css',
    ),
    '#value' => '', // Empty #value needed to complete 'style' tag.
  );
  
  $wrapper['perm_styles'] = $perm_styles;
  
  
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
        '#value' => '',
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
    'text' => 'All modules',
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
    $options = array();
    
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
  
  $filter_form = array(
    '#type' => 'container',
    '#attributes' => array(
      'class' => array(
        'fpa-filter-form',
      ),
    ),
  );
  
  $filter_form['perm_filter'] = array(
    '#type' => 'textfield',
    '#title' => t('Filter:'),
    '#size' => 25,
    '#description' => 'Enter in the format of "permission@module", <br>e.g. admin@system will show only permissions with<br>the text "admin" in modules with the text "system".',
    '#field_suffix' => '<button class="fpa-clear-search">Clear Filter</button>',
    '#attributes' => array(
      'placeholder' => array(
        'permission@module',
      ),
    ),
  );
  
  $filter_form['roles'] = array(
    '#type' => 'select',
    '#title' => t('Roles:'),
    '#size' => 5,
    '#options' => array_combine($user_roles, $user_roles),
    '#value' => $user_roles,
    '#description' => 'Select which roles to display.<br>Ctrl+click to select multiple.',
    '#attributes' => array(
      'multiple' => 'miultiple',
    ),
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
    '#type' => 'markup',
    '#markup' => $permissions_table,
  );
  
  $right_section['table_wrapper'] = $table_wrapper;
  
  return drupal_render($render);
}
